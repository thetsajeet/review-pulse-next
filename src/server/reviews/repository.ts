import type { ReviewRepository } from "../../domain/review-repository";
import { InMemoryReviewRepository } from "./in-memory-review-repository";
import { mockReviews } from "./mock-reviews";

declare global {
  var reviewPulseRepository: ReviewRepository | undefined;
}

export const reviewRepository: ReviewRepository =
  globalThis.reviewPulseRepository ??= new InMemoryReviewRepository(mockReviews);
