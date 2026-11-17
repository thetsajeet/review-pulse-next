import type { ReviewRepository } from "../../domain/review-repository";
import { InMemoryReviewRepository } from "./in-memory-review-repository";
import { mockReviews } from "./mock-reviews";

declare global {
  var cubeccaRepository: ReviewRepository | undefined;
}

export const reviewRepository: ReviewRepository =
  globalThis.cubeccaRepository ??= new InMemoryReviewRepository(mockReviews);
