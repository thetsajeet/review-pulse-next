import { describe, expect, test } from "bun:test";
import { InMemoryReviewRepository } from "../reviews/in-memory-review-repository";
import { mockReviews } from "../reviews/mock-reviews";
import { createReviewWorkflow, DraftWorkflowError } from "./review-workflow";

const sentiment = { sentiment: "negative", summary: "A delayed meal.", themes: ["service"] };

function modelReturning(responses) {
  const inputs = [];
  return {
    inputs,
    async analyze() {
      return sentiment;
    },
    async generate(input) {
      inputs.push(input);
      const response = responses.shift();
      if (response instanceof Error) throw response;
      if (response === undefined) throw new Error("No test response configured.");
      return response;
    },
  };
}

describe("review workflow", () => {
  test("runs initial and refactor graphs with checkpointed, per-review conversation", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const model = modelReturning(["First response.", "Warmer response.", "Other response."]);
    const workflow = createReviewWorkflow(repository, model);
    const first = await workflow.generate("review-marcus");
    const second = await workflow.refactor("review-marcus", "Make it warmer.");
    await workflow.generate("review-priya");

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    expect((await repository.getTimeline("review-marcus")).map((event) => event.type)).toEqual([
      "analysis", "draft", "feedback", "draft",
    ]);
    expect(model.inputs[1].history.map((message) => message.text)).toEqual([
      JSON.stringify({ starRating: "TWO", comment: mockReviews[0].comment }),
      "First response.",
    ]);
    expect(model.inputs[1].latestDraft.content).toBe("First response.");
    expect(model.inputs[2].history).toHaveLength(0);

    const marcus = await workflow.getConversation("review-marcus");
    const priya = await workflow.getConversation("review-priya");
    expect(marcus.threadId).not.toBe(priya.threadId);
    expect(marcus.sentiment).toEqual(sentiment);
    expect((await repository.get("review-marcus")).sentiment).toEqual(sentiment);
    expect((await repository.getTimeline("review-marcus"))[0].analysis).toEqual(sentiment);
    expect(marcus.turns.map((turn) => turn.content)).toEqual([
      JSON.stringify({ starRating: "TWO", comment: mockReviews[0].comment }),
      "First response.",
      "Make it warmer.",
      "Warmer response.",
    ]);
    expect(priya.turns).toHaveLength(2);
  });

  test("retries an oversized UTF-8 reply once, then saves only the valid draft", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const model = modelReturning(["😊".repeat(1025), "Short response."]);
    const workflow = createReviewWorkflow(repository, model);
    const result = await workflow.generate("review-marcus");

    expect(result.content).toBe("Short response.");
    expect(model.inputs).toHaveLength(2);
    expect(model.inputs[1].validationError).toContain("4096 UTF-8 bytes");
    expect(await repository.getTimeline("review-marcus")).toHaveLength(2);
  });

  test("surfaces validation failure without storing a draft and can retry later", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const model = modelReturning(["", " ", "Recovered."]);
    const workflow = createReviewWorkflow(repository, model);
    await expect(workflow.generate("review-marcus")).rejects.toBeInstanceOf(DraftWorkflowError);
    expect(await repository.getTimeline("review-marcus")).toEqual([]);
    expect((await workflow.getConversation("review-marcus")).turns).toEqual([]);

    expect((await workflow.generate("review-marcus")).content).toBe("Recovered.");
    expect((await workflow.getConversation("review-marcus")).turns).toHaveLength(2);
  });

  test("does not commit feedback when model execution fails", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const model = modelReturning(["Initial.", new Error("Provider unavailable"), "Revised."]);
    const workflow = createReviewWorkflow(repository, model);
    await workflow.generate("review-marcus");
    await expect(workflow.refactor("review-marcus", "Be warmer.")).rejects.toThrow("Provider unavailable");
    expect(await repository.getTimeline("review-marcus")).toHaveLength(2);
    expect((await workflow.getConversation("review-marcus")).turns).toHaveLength(2);
    expect((await workflow.refactor("review-marcus", "Be warmer.")).version).toBe(2);
    expect((await repository.getTimeline("review-marcus")).map((event) => event.type)).toEqual([
      "analysis", "draft", "feedback", "draft",
    ]);
  });

  test("preserves the previous conversation if a later analysis fails", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    let calls = 0;
    const workflow = createReviewWorkflow(repository, {
      async analyze() {
        calls += 1;
        if (calls > 1) throw new Error("Analysis unavailable");
        return sentiment;
      },
      async generate() {
        return "Initial.";
      },
    });
    await workflow.generate("review-marcus");
    await expect(workflow.refactor("review-marcus", "Be warmer.")).rejects.toThrow("Analysis unavailable");
    const conversation = await workflow.getConversation("review-marcus");
    expect(conversation.sentiment).toEqual(sentiment);
    expect(conversation.turns).toHaveLength(2);
    expect(await repository.getTimeline("review-marcus")).toHaveLength(2);
  });

  test("rejects concurrent runs for the same review", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    let release;
    const waiting = new Promise((resolve) => { release = resolve; });
    const workflow = createReviewWorkflow(repository, {
      async analyze() {
        await waiting;
        return sentiment;
      },
      async generate() {
        return "Response.";
      },
    });
    const first = workflow.generate("review-marcus");
    await expect(workflow.generate("review-marcus")).rejects.toThrow("already running");
    release();
    expect((await first).content).toBe("Response.");
  });
});
