import { getReviewWorkflow } from "../src/server/workflow";
import { mockReviews } from "../src/server/reviews/mock-reviews";

const workflow = getReviewWorkflow();
const reviewId = mockReviews[0].id;
const first = await workflow.generate(reviewId);
const second = await workflow.refactor(reviewId, "Make the reply shorter and more empathetic.");
const conversation = await workflow.getConversation(reviewId);

if (first.version !== 1 || second.version !== 2 || conversation.turns.length !== 4) {
  throw new Error("Gemini workflow verification failed: unexpected draft or conversation state.");
}

console.log("Initial draft:", first.content);
console.log("Refactored draft:", second.content);
console.log("Sentiment:", conversation.sentiment);
console.log("Verified two drafts and four conversation turns in one review thread.");
