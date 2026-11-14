import {
  InvalidTimelineEventError,
  ReviewNotFoundError,
  type ReviewRepository,
} from "../../domain/review-repository";
import type { DraftVersion, Review, ReviewStatus, TimelineEvent } from "../../domain/reviews";

export class InMemoryReviewRepository implements ReviewRepository {
  private readonly reviews = new Map<string, Review>();
  private readonly timelines = new Map<string, TimelineEvent[]>();

  constructor(seed: readonly Review[]) {
    for (const review of seed) {
      if (this.reviews.has(review.id)) {
        throw new Error(`Duplicate review ID: ${review.id}`);
      }
      if (review.status !== "pending") {
        throw new Error(`Seed review must be pending: ${review.id}`);
      }
      this.reviews.set(review.id, structuredClone(review));
      this.timelines.set(review.id, []);
    }
  }

  async list(status?: ReviewStatus): Promise<Review[]> {
    const reviews = [...this.reviews.values()].filter(
      (review) => status === undefined || review.status === status,
    );
    return structuredClone(reviews);
  }

  async get(reviewId: string): Promise<Review | null> {
    const review = this.reviews.get(reviewId);
    return review ? structuredClone(review) : null;
  }

  async getTimeline(reviewId: string): Promise<TimelineEvent[]> {
    const timeline = this.timelines.get(reviewId);
    if (!timeline) {
      throw new ReviewNotFoundError(reviewId);
    }
    return structuredClone(timeline);
  }

  async appendEvent(event: TimelineEvent): Promise<void> {
    await this.appendEvents([event]);
  }

  async appendEvents(events: readonly TimelineEvent[]): Promise<void> {
    if (events.length === 0) {
      throw new InvalidTimelineEventError("At least one timeline event is required.");
    }

    const reviewId = events[0].reviewId;
    const storedReview = this.reviews.get(reviewId);
    const storedTimeline = this.timelines.get(reviewId);
    if (!storedReview || !storedTimeline) {
      throw new ReviewNotFoundError(reviewId);
    }
    const review = structuredClone(storedReview);
    const timeline = structuredClone(storedTimeline);
    for (const event of events) {
      if (event.reviewId !== reviewId) {
        throw new InvalidTimelineEventError("Events in a batch must belong to the same review.");
      }
      this.validateAndAppend(review, timeline, event);
    }
    this.reviews.set(reviewId, review);
    this.timelines.set(reviewId, timeline);
  }

  private validateAndAppend(review: Review, timeline: TimelineEvent[], event: TimelineEvent): void {
    if (review.status !== "pending") {
      throw new InvalidTimelineEventError("A decided review cannot be modified.");
    }
    if (!event.id.trim() || timeline.some((item) => item.id === event.id)) {
      throw new InvalidTimelineEventError("Timeline event ID must be unique and non-empty.");
    }

    const timestamp = Date.parse(event.createdAt);
    const lastEvent = timeline.at(-1);
    if (!Number.isFinite(timestamp) || (lastEvent && timestamp < Date.parse(lastEvent.createdAt))) {
      throw new InvalidTimelineEventError("Timeline events must have valid, chronological timestamps.");
    }

    const drafts = timeline.filter((item): item is DraftVersion => item.type === "draft");
    const latestDraft = drafts.at(-1);
    if (event.type === "draft") {
      if (!event.content.trim() || event.version !== drafts.length + 1) {
        throw new InvalidTimelineEventError("Draft must have content and the next version number.");
      }
    } else if (event.type === "feedback") {
      if (!latestDraft || !event.content.trim()) {
        throw new InvalidTimelineEventError("Feedback requires an existing draft and non-empty content.");
      }
    } else {
      if (event.type !== "decision" || (event.status !== "approved" && event.status !== "rejected")) {
        throw new InvalidTimelineEventError("Timeline event type or decision status is invalid.");
      }
      if (!latestDraft || event.draftId !== latestDraft.id) {
        throw new InvalidTimelineEventError("Decision must reference the latest draft.");
      }
    }

    timeline.push(structuredClone(event));
    if (event.type === "decision") {
      review.status = event.status;
    }
  }
}
