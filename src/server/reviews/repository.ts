import type { ReviewRepository } from "../../domain/review-repository";
import { InMemoryReviewRepository } from "./in-memory-review-repository";
import { mockReviews } from "./mock-reviews";

export const reviewRepository: ReviewRepository = new InMemoryReviewRepository(mockReviews);
