import { reviewHttp } from "@/server/reviews/http-instance";

export async function POST(
  request: Request,
  context: RouteContext<"/api/reviews/[reviewId]/drafts/[draftId]/refine">,
) {
  const { reviewId, draftId } = await context.params;
  return reviewHttp.refactor(request, reviewId, draftId);
}
