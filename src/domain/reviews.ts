import type { SentimentAnalysis } from "./draft-workflow";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type StarRating =
  | "STAR_RATING_UNSPECIFIED"
  | "ONE"
  | "TWO"
  | "THREE"
  | "FOUR"
  | "FIVE";

export interface GoogleReviewer {
  profilePhotoUrl?: string;
  displayName?: string;
  isAnonymous?: boolean;
}

export interface GoogleReviewReply {
  comment?: string;
  updateTime?: string;
  reviewReplyState?:
    | "REVIEW_REPLY_STATE_UNSPECIFIED"
    | "PENDING"
    | "REJECTED"
    | "APPROVED";
  policyViolation?: string;
}

export interface GoogleReviewMediaItem {
  thumbnailUrl?: string;
  thumbnailLabel?: string;
  videoUrl?: string;
}

export interface GoogleBusinessProfileReview {
  name: string;
  reviewId: string;
  reviewer?: GoogleReviewer;
  starRating?: StarRating;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: GoogleReviewReply;
  reviewMediaItems?: GoogleReviewMediaItem[];
}

export interface Review extends GoogleBusinessProfileReview {
  id: string;
  location: {
    id: string;
    name: string;
  };
  status: ReviewStatus;
  sentiment?: SentimentAnalysis;
}

interface TimelineEventBase {
  id: string;
  reviewId: string;
  createdAt: string;
}

export interface DraftVersion extends TimelineEventBase {
  type: "draft";
  version: number;
  content: string;
}

export interface HumanFeedback extends TimelineEventBase {
  type: "feedback";
  content: string;
}

export interface ReviewAnalysis extends TimelineEventBase {
  type: "analysis";
  analysis: SentimentAnalysis;
}

export interface ReviewDecision extends TimelineEventBase {
  type: "decision";
  draftId: string;
  status: Exclude<ReviewStatus, "pending">;
}

export type TimelineEvent = DraftVersion | HumanFeedback | ReviewAnalysis | ReviewDecision;
