import type { DraftWorkflow } from "../../domain/draft-workflow";
import { reviewRepository } from "../reviews/repository";
import { createGeminiModel } from "./gemini-model";
import { createReviewWorkflow } from "./review-workflow";

let workflow: DraftWorkflow | undefined;

export function getReviewWorkflow(): DraftWorkflow {
  if (!workflow) {
    workflow = createReviewWorkflow(
      reviewRepository,
      createGeminiModel(process.env.GEMINI_API_KEY ?? "", process.env.GEMINI_MODEL),
    );
  }
  return workflow;
}
