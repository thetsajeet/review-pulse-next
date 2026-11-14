import { connection } from "next/server";
import { reviewHttp } from "@/server/reviews/http-instance";

export async function GET(_request: Request, context: RouteContext<"/api/reviews/[reviewId]">) {
  await connection();
  const { reviewId } = await context.params;
  return reviewHttp.get(reviewId);
}
