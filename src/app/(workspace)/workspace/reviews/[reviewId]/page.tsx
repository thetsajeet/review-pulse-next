import { Suspense } from "react";
import { CommandCenter } from "@/components/command-center/command-center";

async function ReviewContent({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = await params;
  return <CommandCenter initialReviewId={reviewId} />;
}

export default function ReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
  return <Suspense fallback={<div role="status">Loading review...</div>}><ReviewContent params={params} /></Suspense>;
}
