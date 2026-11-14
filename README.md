# Review Pulse

A landing-page concept and workflow foundation for a human-in-the-loop review
triage assistant. The landing-page preview uses illustrative data and is not
connected to the workflow or Google Business Profile.

## Getting started

Requires Bun 1.4.4 and Node.js 20.9 or later.

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `bun test`,
`bun run lint`, and `bun run build` to validate changes.

## Review foundation

`src/domain` defines reviews, timeline events, and the asynchronous repository
contract. `src/server/reviews` provides a seeded in-memory implementation and
the current repository instance. The adapter records ordered draft, feedback,
and decision events; decisions atomically update the review status. Draft
versions are sequential, feedback requires a draft, and a decision must refer
to the latest version. Decisions are terminal in this demo. Missing reviews
and invalid timeline events produce explicit errors. Seeded reviews have no
AI-generated drafts.

The review model follows the
[Google Business Profile Review resource](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews):
it retains Google's resource name, review ID, reviewer, star-rating enum,
timestamps, and optional reply and media fields. The internal `id`, `location`,
and `status` are Review Pulse fields; local triage status is distinct from
Google's reply moderation state. Google identifiers are required by the app;
other source fields may be absent, including comments on rating-only reviews.

This storage is local to one server process and resets on restart or module
reload. It is not shared across instances and is not suitable for production.
There are no review APIs yet; the landing-page preview remains illustrative.
A future database adapter can implement the repository contract.

## LangGraph and Gemini

The server-side review workflow uses LangGraph and Gemini to analyze a review,
generate a response, validate it, and save a draft. Invalid or oversized replies
are retried once. Refactoring stores the owner's feedback and new draft
atomically. Per-review conversations and sentiment are checkpointed in memory
under a stable thread ID; the system prompt is supplied on every model call.
The default checkpointer and repository are process-local and reset on restart;
the workflow factory accepts alternative implementations. AI drafts require
human review and are not guaranteed to be factually accurate.

To run a real Gemini check, put `GEMINI_API_KEY` in `.env.local` (see
`.env.example`) and run `bun run verify:gemini`. `GEMINI_MODEL` optionally
overrides the default `gemini-3.5-flash-lite`. The check sends only seeded mock
review data to Gemini, makes multiple model calls, and may incur API charges.
It does not publish to Google. Regular tests use a stub model and do not call
Gemini.

## UI foundation

The app uses Next.js, React, Tailwind CSS, shadcn/ui's neutral theme, and
Motion. Theme colors are CSS variables in `src/app/globals.css`; the
landing-page layout is in `src/app/landing.css`. The Aceternity UI registry is
configured in `components.json` so components can be added with the shadcn
CLI when needed; no Aceternity component is used in this initial page.
