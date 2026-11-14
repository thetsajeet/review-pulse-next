import { z } from "zod";
import {
  decisionEventSchema,
  draftEventSchema,
  reviewDetailResponseSchema,
  reviewListResponseSchema,
} from "@/domain/review-contract";

export class ReviewApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(url: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("The server returned an invalid response.");
    throw error;
  }
  if (!response.ok) {
    const parsed = z.object({ error: z.string() }).safeParse(payload);
    throw new ReviewApiError(parsed.success ? parsed.data.error : "The request failed.", response.status);
  }
  return schema.parse(payload);
}

function post<T>(url: string, body: object, schema: z.ZodType<T>): Promise<T> {
  return request(url, schema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const draftResponseSchema = z.object({ draft: draftEventSchema });
const decisionResponseSchema = z.object({ decision: decisionEventSchema });
const pendingGenerations = new Map<string, Promise<void>>();

export const reviewApi = {
  list: () => request("/api/reviews", reviewListResponseSchema),
  get: (reviewId: string) =>
    request(`/api/reviews/${encodeURIComponent(reviewId)}`, reviewDetailResponseSchema),
  generate(reviewId: string) {
    const pending = pendingGenerations.get(reviewId);
    if (pending) return pending;
    const generation = post(
      `/api/reviews/${encodeURIComponent(reviewId)}/drafts`,
      {},
      draftResponseSchema,
    ).then(() => undefined).finally(() => pendingGenerations.delete(reviewId));
    pendingGenerations.set(reviewId, generation);
    return generation;
  },
  refactor: (reviewId: string, draftId: string, instruction: string) =>
    post(
      `/api/reviews/${encodeURIComponent(reviewId)}/drafts/${encodeURIComponent(draftId)}/refine`,
      { instruction },
      draftResponseSchema,
    ),
  decide: (reviewId: string, draftId: string, decision: "approve" | "reject") =>
    post(
      `/api/reviews/${encodeURIComponent(reviewId)}/${decision}`,
      { draftId },
      decisionResponseSchema,
    ),
};
