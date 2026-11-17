import { describe, expect, test } from "bun:test";
import { createReviewWorkflow } from "../workflow/review-workflow";
import { createReviewHttpHandlers } from "./http";
import { InMemoryReviewRepository } from "./in-memory-review-repository";
import { mockReviews } from "./mock-reviews";
import { createReviewService } from "./service";

const reviewId = mockReviews[0].id;

function setup() {
  const repository = new InMemoryReviewRepository(mockReviews);
  let generation = 0;
  const workflow = createReviewWorkflow(repository, {
    async analyze() {
      return { sentiment: "negative", summary: "A delayed meal.", themes: ["service"] };
    },
    async generate() {
      generation += 1;
      return `Draft ${generation}`;
    },
  });
  return createReviewHttpHandlers(createReviewService(repository, () => workflow));
}

function post(body, headers = {}) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("review HTTP handlers", () => {
  test("lists and retrieves reviews and rejects invalid requests", async () => {
    const api = setup();
    const list = await api.list(new Request("http://localhost/api/reviews?status=pending"));
    expect(list.status).toBe(200);
    expect(list.headers.get("cache-control")).toBe("no-store");
    expect((await list.json()).reviews).toHaveLength(5);
    expect((await api.get("missing")).status).toBe(404);
    expect((await api.list(new Request("http://localhost/api/reviews?status=unknown"))).status).toBe(400);
    expect((await api.refactor(post({ instruction: " " }), reviewId, "draft")).status).toBe(400);
    expect((await api.generate(post("{"), reviewId)).status).toBe(400);
    expect((await api.generate(post({}, { Origin: "https://other.example" }), reviewId)).status).toBe(403);
    expect((await api.generate(post({}, {
      Origin: "http://other.example",
      Host: "127.0.0.1:3181",
    }), reviewId)).status).toBe(403);
    expect((await api.generate(post({}, {
      Origin: "http://127.0.0.1:3181",
      Host: "127.0.0.1:3181",
    }), reviewId)).status).toBe(201);
  });

  test("generates, refactors, and records a local decision with stale-draft protection", async () => {
    const api = setup();
    const initial = await api.generate(post({}), reviewId);
    expect(initial.status).toBe(201);
    const first = (await initial.json()).draft;
    const refined = await api.refactor(post({ instruction: "Make it shorter." }), reviewId, first.id);
    expect(refined.status).toBe(201);
    const second = (await refined.json()).draft;
    expect(second.version).toBe(2);
    expect((await api.refactor(post({ instruction: "Try again." }), reviewId, first.id)).status).toBe(409);
    expect((await api.decide(post({ draftId: first.id }), reviewId, "approved")).status).toBe(409);

    const approved = await api.decide(post({ draftId: second.id }), reviewId, "approved");
    expect(approved.status).toBe(201);
    const detail = await (await api.get(reviewId)).json();
    expect(detail.review.status).toBe("approved");
    expect(detail.timeline.map((event) => event.type)).toEqual(["analysis", "draft", "feedback", "draft", "decision"]);
    expect(detail.review.sentiment.sentiment).toBe("negative");
    const approvedReviews = (await api.list(new Request("http://localhost/api/reviews?status=approved")).then((response) => response.json())).reviews;
    expect(approvedReviews).toHaveLength(1);
    expect(approvedReviews[0].sentiment.sentiment).toBe("negative");
    expect((await api.decide(post({ draftId: second.id }), reviewId, "rejected")).status).toBe(409);
  });
});
