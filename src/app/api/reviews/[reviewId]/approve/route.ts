import { reviewHttp } from "@/server/reviews/http-instance";

export async function POST(request: Request, context: RouteContext<"/api/reviews/[reviewId]/approve">) {
  const { reviewId } = await context.params;
  return reviewHttp.decide(request, reviewId, "approved");
}
