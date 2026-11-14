import { reviewHttp } from "@/server/reviews/http-instance";

export async function POST(request: Request, context: RouteContext<"/api/reviews/[reviewId]/drafts">) {
  const { reviewId } = await context.params;
  return reviewHttp.generate(request, reviewId);
}
