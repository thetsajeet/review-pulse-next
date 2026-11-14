import type { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { SentimentAnalysis } from "../../domain/draft-workflow";
import type { DraftVersion, Review } from "../../domain/reviews";

export const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  summary: z.string().describe("A concise factual summary of the review."),
  themes: z.array(z.string()).describe("The main topics actually mentioned in the review."),
});

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
