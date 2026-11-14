import { randomUUID } from "node:crypto";
import type { DraftContext, DraftWorkflow } from "../../domain/draft-workflow";
import { ReviewNotFoundError, type ReviewRepository } from "../../domain/review-repository";
import type { ReviewStatus } from "../../domain/reviews";

export function createReviewService(repository: ReviewRepository, getWorkflow: () => DraftWorkflow) {
  return {
    list: (status?: ReviewStatus) => repository.list(status),
    async get(reviewId: string) {
      const review = await repository.get(reviewId);
      if (!review) throw new ReviewNotFoundError(reviewId);
      return { review, timeline: await repository.getTimeline(reviewId) };
    },
    generate: (reviewId: string, context?: DraftContext) =>
      getWorkflow().generate(reviewId, context),
    refactor: (reviewId: string, draftId: string, instruction: string, context?: DraftContext) =>
      getWorkflow().refactor(reviewId, instruction, context, draftId),
    async decide(reviewId: string, draftId: string, status: "approved" | "rejected") {
      const decision = {
        type: "decision" as const,
        id: randomUUID(),
        reviewId,
        draftId,
        status,
        createdAt: new Date().toISOString(),
      };
      await repository.appendEvent(decision);
      return decision;
    },
  };
}
