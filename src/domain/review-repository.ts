import type { Review, ReviewStatus, TimelineEvent } from "./reviews";

export interface ReviewRepository {
  list(status?: ReviewStatus): Promise<Review[]>;
  get(reviewId: string): Promise<Review | null>;
  getTimeline(reviewId: string): Promise<TimelineEvent[]>;
  /** Appends the event and updates the review status atomically for a decision. */
  appendEvent(event: TimelineEvent): Promise<void>;
}

export class ReviewNotFoundError extends Error {
  constructor(reviewId: string) {
    super(`Review not found: ${reviewId}`);
    this.name = "ReviewNotFoundError";
  }
}

export class InvalidTimelineEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimelineEventError";
  }
}
