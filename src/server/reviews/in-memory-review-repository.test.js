import { describe, expect, test } from "bun:test";
import {
  InvalidTimelineEventError,
  ReviewNotFoundError,
} from "../../domain/review-repository";
import { InMemoryReviewRepository } from "./in-memory-review-repository";
import { mockReviews } from "./mock-reviews";

const draft = {
  type: "draft",
  id: "draft-1",
  reviewId: "review-marcus",
  createdAt: "2026-11-14T06:00:00.000Z",
  version: 1,
  content: "Thank you for your feedback.",
};

const feedback = {
  type: "feedback",
  id: "feedback-1",
  reviewId: "review-marcus",
  createdAt: "2026-11-14T06:01:00.000Z",
  content: "Make it warmer.",
};

const revision = {
  ...draft,
  id: "draft-2",
  createdAt: "2026-11-14T06:02:00.000Z",
  version: 2,
  content: "Thank you for sharing this. We are truly sorry.",
};

describe("InMemoryReviewRepository", () => {
  test("starts with isolated pending reviews and no fabricated timeline", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const reviews = await repository.list("pending");
    expect(reviews).toHaveLength(5);
    expect(await repository.list("approved")).toEqual([]);
    expect(await repository.getTimeline("review-marcus")).toEqual([]);

    reviews[0].reviewer.displayName = "Changed";
    expect((await repository.get("review-marcus")).reviewer.displayName).toBe("Marcus Webb");
    expect(await repository.get("missing")).toBeNull();
    await expect(repository.getTimeline("missing")).rejects.toBeInstanceOf(ReviewNotFoundError);
  });

  test("preserves Google-shaped anonymous, rating-only reviews and existing replies", async () => {
    const review = {
      id: "review-anonymous",
      name: "accounts/mock-account/locations/location-brewhouse/reviews/mock-anonymous",
      reviewId: "mock-anonymous",
      location: { id: "location-brewhouse", name: "Brewhouse Koregaon Park" },
      reviewer: { isAnonymous: true },
      starRating: "FOUR",
      createTime: "2026-11-13T14:12:00.000Z",
      updateTime: "2026-11-13T14:12:00.000Z",
      reviewReply: {
        comment: "Thank you.",
        updateTime: "2026-11-13T14:15:00.000Z",
        reviewReplyState: "PENDING",
      },
      reviewMediaItems: [{ thumbnailUrl: "https://example.com/thumbnail" }],
      status: "pending",
    };
    const repository = new InMemoryReviewRepository([review]);
    expect(await repository.get(review.id)).toEqual(review);
    await repository.appendEvent({
      ...draft,
      reviewId: review.id,
    });
    await repository.appendEvent({
      type: "decision",
      id: "decision-anonymous",
      reviewId: review.id,
      createdAt: "2026-11-14T06:01:00.000Z",
      draftId: draft.id,
      status: "approved",
    });
    const stored = await repository.get(review.id);
    expect(stored.status).toBe("approved");
    expect(stored.reviewReply.reviewReplyState).toBe("PENDING");
    expect(stored.comment).toBeUndefined();
  });

  test("retains a review's ordered conversation and updates status on a decision", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    await repository.appendEvent(draft);
    await repository.appendEvent(feedback);
    await repository.appendEvent(revision);
    await repository.appendEvent({
      type: "decision",
      id: "decision-1",
      reviewId: draft.reviewId,
      createdAt: "2026-11-14T06:03:00.000Z",
      draftId: revision.id,
      status: "approved",
    });

    const timeline = await repository.getTimeline(draft.reviewId);
    expect(timeline.map((event) => event.id)).toEqual([
      "draft-1", "feedback-1", "draft-2", "decision-1",
    ]);
    expect((await repository.get(draft.reviewId)).status).toBe("approved");
    expect((await repository.list("approved")).map((review) => review.id)).toEqual([draft.reviewId]);
    expect(await repository.getTimeline("review-priya")).toEqual([]);

    timeline[0].content = "Changed";
    expect((await repository.getTimeline(draft.reviewId))[0].content).toBe(draft.content);
    await expect(repository.appendEvent(feedback)).rejects.toBeInstanceOf(InvalidTimelineEventError);
  });

  test("records rejection without publishing and isolates repository instances", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    await repository.appendEvent(draft);
    await repository.appendEvent({
      type: "decision",
      id: "decision-2",
      reviewId: draft.reviewId,
      createdAt: "2026-11-14T06:01:00.000Z",
      draftId: draft.id,
      status: "rejected",
    });

    expect((await repository.get(draft.reviewId)).status).toBe("rejected");
    expect((await new InMemoryReviewRepository(mockReviews).get(draft.reviewId)).status).toBe("pending");
  });

  test("rejects invalid events without changing stored history", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    await expect(repository.appendEvent(feedback)).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({ ...draft, reviewId: "missing" })).rejects.toBeInstanceOf(ReviewNotFoundError);
    await repository.appendEvent(draft);
    await expect(repository.appendEvent(draft)).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({ ...revision, version: 3 })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({ ...feedback, createdAt: "invalid" })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({ ...feedback, createdAt: "2026-11-14T05:59:00.000Z" })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({
      type: "decision",
      id: "decision-invalid",
      reviewId: draft.reviewId,
      createdAt: feedback.createdAt,
      draftId: "other-draft",
      status: "approved",
    })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    expect(await repository.getTimeline(draft.reviewId)).toEqual([draft]);
    expect((await repository.get(draft.reviewId)).status).toBe("pending");

    await repository.appendEvent(revision);
    await expect(repository.appendEvent({
      type: "decision",
      id: "decision-stale",
      reviewId: draft.reviewId,
      createdAt: "2026-11-14T06:03:00.000Z",
      draftId: draft.id,
      status: "approved",
    })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    await expect(repository.appendEvent({
      type: "decision",
      id: "decision-invalid-status",
      reviewId: draft.reviewId,
      createdAt: "2026-11-14T06:03:00.000Z",
      draftId: revision.id,
      status: "pending",
    })).rejects.toBeInstanceOf(InvalidTimelineEventError);
    expect(await repository.getTimeline(draft.reviewId)).toEqual([draft, revision]);
  });

  test("copies events on write so caller mutations do not alter history", async () => {
    const repository = new InMemoryReviewRepository(mockReviews);
    const event = { ...draft };
    await repository.appendEvent(event);
    event.content = "Changed";
    expect((await repository.getTimeline(draft.reviewId))[0].content).toBe(draft.content);
  });
});
