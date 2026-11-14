import type { DraftVersion } from "./reviews";

export interface SentimentAnalysis {
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  summary: string;
  themes: string[];
}

export interface DraftContext {
  tone?: string;
  businessContext?: string;
}

export interface DraftConversation {
  threadId: string;
  sentiment: SentimentAnalysis | null;
  turns: { role: "user" | "assistant"; content: string }[];
}

export interface DraftWorkflow {
  generate(reviewId: string, context?: DraftContext): Promise<DraftVersion>;
  refactor(
    reviewId: string,
    instruction: string,
    context?: DraftContext,
    expectedDraftId?: string,
  ): Promise<DraftVersion>;
  getConversation(reviewId: string): Promise<DraftConversation>;
}
