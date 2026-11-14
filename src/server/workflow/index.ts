import type { DraftWorkflow } from "../../domain/draft-workflow";
import { reviewRepository } from "../reviews/repository";
import { createGeminiModel } from "./gemini-model";
import { createReviewWorkflow } from "./review-workflow";

declare global {
  var reviewPulseWorkflow: DraftWorkflow | undefined;
}

export function getReviewWorkflow(): DraftWorkflow {
  if (!globalThis.reviewPulseWorkflow) {
    globalThis.reviewPulseWorkflow = createReviewWorkflow(
      reviewRepository,
      createGeminiModel(process.env.GEMINI_API_KEY ?? "", process.env.GEMINI_MODEL),
    );
  }
  return globalThis.reviewPulseWorkflow;
}
