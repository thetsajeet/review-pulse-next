import { z } from "zod";
import type { Review, TimelineEvent } from "./reviews";

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const reviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  reviewId: z.string(),
  location: z.object({ id: z.string(), name: z.string() }),
  reviewer: z.object({
    profilePhotoUrl: z.string().optional(),
    displayName: z.string().optional(),
    isAnonymous: z.boolean().optional(),
  }).optional(),
  starRating: z.enum(["STAR_RATING_UNSPECIFIED", "ONE", "TWO", "THREE", "FOUR", "FIVE"]).optional(),
  comment: z.string().optional(),
  createTime: z.string().optional(),
  updateTime: z.string().optional(),
  reviewReply: z.object({
    comment: z.string().optional(),
    updateTime: z.string().optional(),
    reviewReplyState: z.enum(["REVIEW_REPLY_STATE_UNSPECIFIED", "PENDING", "REJECTED", "APPROVED"]).optional(),
    policyViolation: z.string().optional(),
  }).optional(),
  reviewMediaItems: z.array(z.object({
    thumbnailUrl: z.string().optional(),
    thumbnailLabel: z.string().optional(),
    videoUrl: z.string().optional(),
  })).optional(),
  status: reviewStatusSchema,
}) satisfies z.ZodType<Review>;

const eventBase = {
  id: z.string(),
  reviewId: z.string(),
  createdAt: z.string(),
};

export const draftEventSchema = z.object({
  ...eventBase, type: z.literal("draft"), version: z.number(), content: z.string(),
});
export const decisionEventSchema = z.object({
  ...eventBase,
  type: z.literal("decision"),
  draftId: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export const timelineEventSchema = z.discriminatedUnion("type", [
  draftEventSchema,
  z.object({ ...eventBase, type: z.literal("feedback"), content: z.string() }),
  decisionEventSchema,
]) satisfies z.ZodType<TimelineEvent>;

export const reviewListResponseSchema = z.object({ reviews: z.array(reviewSchema) });
export const reviewDetailResponseSchema = z.object({
  review: reviewSchema,
  timeline: z.array(timelineEventSchema),
});
