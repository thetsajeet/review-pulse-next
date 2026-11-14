import { connection } from "next/server";
import { reviewHttp } from "@/server/reviews/http-instance";

export async function GET(request: Request) {
  await connection();
  return reviewHttp.list(request);
}
