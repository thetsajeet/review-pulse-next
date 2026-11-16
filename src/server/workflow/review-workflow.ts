import { createHash, randomUUID } from "node:crypto";
import { AIMessage, HumanMessage, isBaseMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema, type BaseCheckpointSaver } from "@langchain/langgraph";
import { z } from "zod";
import type { DraftContext, DraftConversation, DraftWorkflow } from "../../domain/draft-workflow";
import { ReviewNotFoundError, type ReviewRepository } from "../../domain/review-repository";
import type { DraftVersion, Review, TimelineEvent } from "../../domain/reviews";
import { sentimentSchema, type ReviewModel } from "./model";

const WorkflowState = new StateSchema({
  reviewId: z.string(),
  instruction: z.string().nullable(),
  expectedDraftId: z.string().nullable(),
  tone: z.string(),
  businessContext: z.string(),
  review: z.custom<Review>().nullable(),
  latestDraft: z.custom<DraftVersion>().nullable(),
  sentiment: sentimentSchema.nullable().optional(),
  candidate: z.string().nullable(),
  validationError: z.string().nullable(),
  attempts: z.number(),
  savedDraft: z.custom<DraftVersion>().nullable(),
  messages: MessagesValue,
});

const snapshotSchema = z.object({
  messages: z.array(z.custom<BaseMessage>(isBaseMessage)).optional(),
  sentiment: sentimentSchema.nullable().optional(),
});

export class DraftWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DraftWorkflowError";
  }
}

function threadId(reviewId: string): string {
  return `review:${createHash("sha256").update(reviewId).digest("hex")}`;
}

export function createReviewWorkflow(
  repository: ReviewRepository,
  model: ReviewModel,
  checkpointer: BaseCheckpointSaver = new MemorySaver(),
): DraftWorkflow {
  const activeReviews = new Set<string>();
  const graph = new StateGraph(WorkflowState)
    .addNode("load", async (state) => {
      const review = await repository.get(state.reviewId);
      if (!review) {
        throw new ReviewNotFoundError(state.reviewId);
      }
      if (review.status !== "pending") {
        throw new DraftWorkflowError("A decided review cannot be drafted.");
      }
      const timeline = await repository.getTimeline(state.reviewId);
      const drafts = timeline.filter((event): event is DraftVersion => event.type === "draft");
      const latestDraft = drafts.at(-1) ?? null;
      if (state.instruction === null && latestDraft) {
        throw new DraftWorkflowError("An initial draft already exists for this review.");
      }
      if (state.instruction !== null && !latestDraft) {
        throw new DraftWorkflowError("A draft is required before refactoring.");
      }
      if (state.expectedDraftId !== null && latestDraft?.id !== state.expectedDraftId) {
        throw new DraftWorkflowError("The draft has changed. Refresh and try again.");
      }
      return { review, latestDraft };
    })
    .addNode("analyze", async (state) => {
      if (!state.review) throw new DraftWorkflowError("Review context is missing.");
      return { sentiment: await model.analyze(state.review) };
    })
    .addNode("generate", async (state) => {
      if (!state.review || !state.sentiment) {
        throw new DraftWorkflowError("Review context or sentiment is missing.");
      }
      const candidate = await model.generate({
        review: state.review,
        sentiment: state.sentiment,
        tone: state.tone,
        businessContext: state.businessContext,
        instruction: state.instruction,
        latestDraft: state.latestDraft,
        history: state.messages,
        validationError: state.validationError,
      });
      return { candidate, attempts: state.attempts + 1 };
    })
    .addNode("validate", (state) => {
      const candidate = state.candidate?.trim() ?? "";
      const validationError = !candidate
        ? "The response must not be empty."
        : Buffer.byteLength(candidate, "utf8") > 4096
          ? "The response must not exceed 4096 UTF-8 bytes."
          : null;
      return { candidate, validationError };
    })
    .addNode("save", async (state) => {
      if (!state.review || !state.sentiment || !state.candidate || state.validationError) {
        throw new DraftWorkflowError("Cannot save an invalid draft.");
      }
      const createdAt = new Date().toISOString();
      const draft: DraftVersion = {
        type: "draft",
        id: randomUUID(),
        reviewId: state.reviewId,
        version: (state.latestDraft?.version ?? 0) + 1,
        content: state.candidate,
        createdAt,
      };
      const events: TimelineEvent[] = [];
      if (state.instruction === null) {
        events.push({
          type: "analysis",
          id: randomUUID(),
          reviewId: state.reviewId,
          analysis: state.sentiment,
          createdAt,
        });
      } else {
        events.push({
          type: "feedback",
          id: randomUUID(),
          reviewId: state.reviewId,
          content: state.instruction,
          createdAt,
        });
      }
      events.push(draft);
      await repository.appendEvents(events);
      const userTurn = state.instruction ?? JSON.stringify({
        starRating: state.review.starRating,
        comment: state.review.comment,
      });
      return {
        savedDraft: draft,
        messages: [new HumanMessage(userTurn), new AIMessage(draft.content)],
      };
    })
    .addNode("fail", (state) => {
      throw new DraftWorkflowError(`Draft validation failed: ${state.validationError}`);
    })
    .addEdge(START, "load")
    .addEdge("load", "analyze")
    .addEdge("analyze", "generate")
    .addEdge("generate", "validate")
    .addConditionalEdges("validate", (state) => {
      if (!state.validationError) return "save";
      return state.attempts < 2 ? "generate" : "fail";
    })
    .addEdge("save", END)
    .addEdge("fail", END)
    .compile({ checkpointer });

  async function run(
    reviewId: string,
    instruction: string | null,
    context: DraftContext = {},
    expectedDraftId: string | null = null,
  ) {
    if (!reviewId.trim()) throw new DraftWorkflowError("Review ID is required.");
    if (instruction !== null && !instruction.trim()) {
      throw new DraftWorkflowError("Refactor instructions must not be empty.");
    }
    if (activeReviews.has(reviewId)) {
      throw new DraftWorkflowError("A workflow is already running for this review.");
    }
    activeReviews.add(reviewId);
    try {
      const result = await graph.invoke(
        {
          reviewId,
          instruction: instruction?.trim() ?? null,
          expectedDraftId,
          tone: context.tone?.trim() || "Professional",
          businessContext: context.businessContext?.trim() ?? "",
          review: null,
          latestDraft: null,
          candidate: null,
          validationError: null,
          attempts: 0,
          savedDraft: null,
          messages: [],
        },
        { configurable: { thread_id: threadId(reviewId) } },
      );
      if (!result.savedDraft) throw new DraftWorkflowError("The workflow did not save a draft.");
      return result.savedDraft;
    } finally {
      activeReviews.delete(reviewId);
    }
  }

  return {
    generate: (reviewId, context) => run(reviewId, null, context),
    refactor: (reviewId, instruction, context, expectedDraftId) =>
      run(reviewId, instruction, context, expectedDraftId),
    async getConversation(reviewId): Promise<DraftConversation> {
      if (!(await repository.get(reviewId))) throw new ReviewNotFoundError(reviewId);
      const id = threadId(reviewId);
      const snapshot = await graph.getState({ configurable: { thread_id: id } });
      const { messages = [], sentiment = null } = snapshotSchema.parse(snapshot.values ?? {});
      return {
        threadId: id,
        sentiment,
        turns: messages
          .filter((message) => message.getType() === "human" || message.getType() === "ai")
          .map((message) => ({
            role: message.getType() === "human" ? "user" as const : "assistant" as const,
            content: message.text,
          })),
      };
    },
  };
}
