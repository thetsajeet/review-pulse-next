import type { BaseMessage } from "@langchain/core/messages";
import { sentimentAnalysisSchema } from "../../domain/review-contract";
import type { SentimentAnalysis } from "../../domain/draft-workflow";
import type { DraftVersion, Review } from "../../domain/reviews";

export const sentimentSchema = sentimentAnalysisSchema;

export interface DraftModelInput {
  review: Review;
  sentiment: SentimentAnalysis;
  tone: string;
  businessContext: string;
  instruction: string | null;
  latestDraft: DraftVersion | null;
  history: BaseMessage[];
  validationError: string | null;
}

export interface ReviewModel {
  analyze(review: Review): Promise<SentimentAnalysis>;
  generate(input: DraftModelInput): Promise<string>;
}
