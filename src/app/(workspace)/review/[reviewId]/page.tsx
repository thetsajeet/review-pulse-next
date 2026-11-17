import { Suspense } from "react";
import { redirect } from "next/navigation";
import { mockReviews } from "@/server/reviews/mock-reviews";

async function RedirectReview({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  const legacyReview = mockReviews.find((review) => review.reviewId.startsWith("mock-") && `review-${review.reviewId.slice("mock-".length)}` === reviewId);
  return redirect(`/workspace/reviews/${encodeURIComponent(legacyReview?.id ?? reviewId)}`);
}

export default function PreviousReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
  return <Suspense fallback={<div role="status">Loading review...</div>}><RedirectReview params={params} /></Suspense>;
}
