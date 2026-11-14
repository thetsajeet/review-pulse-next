import { z, ZodError } from "zod";
import { reviewStatusSchema } from "../../domain/review-contract";
import { InvalidTimelineEventError, ReviewNotFoundError } from "../../domain/review-repository";
import { GeminiConfigurationError } from "../workflow/gemini-model";
import { DraftWorkflowError } from "../workflow/review-workflow";
import type { createReviewService } from "./service";

type ReviewService = ReturnType<typeof createReviewService>;

class RequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const contextSchema = z.object({
  tone: z.string().trim().min(1).max(100).optional(),
  businessContext: z.string().trim().max(4000).optional(),
}).strict();
const generateSchema = z.object({ context: contextSchema.optional() }).strict();
const refactorSchema = z.object({
  instruction: z.string().trim().min(1).max(4000),
  context: contextSchema.optional(),
}).strict();
const decisionSchema = z.object({ draftId: z.string().trim().min(1) }).strict();

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function respond(operation: () => Promise<Response>): Promise<Response> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RequestError) return json({ error: error.message }, error.status);
    if (error instanceof ZodError) return json({ error: "Invalid request. Check the supplied fields." }, 400);
    if (error instanceof ReviewNotFoundError) return json({ error: "Review not found." }, 404);
    if (error instanceof InvalidTimelineEventError || error instanceof DraftWorkflowError) {
      return json({ error: error.message }, 409);
    }
    if (error instanceof GeminiConfigurationError) return json({ error: error.message }, 503);
    console.error("Review API operation failed:", error instanceof Error ? error.name : "Unknown error");
    return json({ error: "The operation failed. Check the server logs and try again." }, 500);
  }
}

async function requestJson(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  if (origin && origin !== `${url.protocol}//${host}`) {
    throw new RequestError("Cross-origin requests are not allowed.", 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestError("Content-Type must be application/json.", 415);
  }
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new RequestError("Invalid JSON body.", 400);
    throw error;
  }
}

export function createReviewHttpHandlers(service: ReviewService) {
  return {
    list(request: Request) {
      return respond(async () => {
        const status = reviewStatusSchema.optional().parse(new URL(request.url).searchParams.get("status") ?? undefined);
        return json({ reviews: await service.list(status) });
      });
    },
    get(reviewId: string) {
      return respond(async () => json(await service.get(reviewId)));
    },
    generate(request: Request, reviewId: string) {
      return respond(async () => {
        const input = generateSchema.parse(await requestJson(request));
        return json({ draft: await service.generate(reviewId, input.context) }, 201);
      });
    },
    refactor(request: Request, reviewId: string, draftId: string) {
      return respond(async () => {
        const input = refactorSchema.parse(await requestJson(request));
        return json({ draft: await service.refactor(reviewId, draftId, input.instruction, input.context) }, 201);
      });
    },
    decide(request: Request, reviewId: string, status: "approved" | "rejected") {
      return respond(async () => {
        const input = decisionSchema.parse(await requestJson(request));
        return json({ decision: await service.decide(reviewId, input.draftId, status) }, 201);
      });
    },
  };
}
