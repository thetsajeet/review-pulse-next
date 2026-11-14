import { reviewHttp } from "@/server/reviews/http-instance";

export async function POST(request: Request, context: RouteContext<"/api/reviews/[reviewId]/reject">) {
  const { reviewId } = await context.params;
  return reviewHttp.decide(request, reviewId, "rejected");
}
