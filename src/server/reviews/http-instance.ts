import { getReviewWorkflow } from "../workflow";
import { createReviewHttpHandlers } from "./http";
import { reviewRepository } from "./repository";
import { createReviewService } from "./service";

export const reviewHttp = createReviewHttpHandlers(createReviewService(reviewRepository, getReviewWorkflow));
