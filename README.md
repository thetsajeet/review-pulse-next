# Cubecca

A human-in-the-loop review triage prototype with a Command Center, REST API,
and LangGraph/Gemini workflow. It uses mock reviews and does not connect to
Google Business Profile. The landing-page preview is illustrative.

## Getting started

Requires Bun 1.4.4 and Node.js 20.9 or later.

```bash
bun install
bun run dev
```

Set `GEMINI_API_KEY` in `.env.local` (see `.env.example`) before generating
drafts. Open [http://localhost:3000/command-center](http://localhost:3000/command-center),
select a pending review to generate its first draft, and optionally provide
feedback to refactor it. Approve or reject records a local decision only;
nothing is published to Google. AI drafts can contain inaccurate or unsupported
claims, so review them carefully.

The `/login`, `/signup`, and `/signed-out` routes preview the authentication
screens; Google sign-in and sign-out are not connected. `/dashboard` shows
illustrative metrics rather than live review analytics. Its inbox link opens
the review inbox.

Decorative cube and workflow animations follow `resources/animations.md` and
pause outside the viewport. Reduced-motion preferences disable decorative
motion; the dashboard remains static.

Run `bun test`,
`bun run lint`, and `bun run build` to validate changes.

## Review foundation

`src/domain` defines reviews, timeline events, and the asynchronous repository
contract. `src/server/reviews` provides a seeded in-memory implementation and
the current repository instance. The adapter records ordered analysis, draft,
feedback, and decision events; decisions atomically update the review status. Draft
versions are sequential, feedback requires a draft, and a decision must refer
to the latest version. Decisions are terminal. Missing reviews
and invalid timeline events produce explicit errors. Seeded reviews have no
AI-generated drafts or sentiment. Initial analysis is saved atomically with
the first draft and exposed on the review and in its timeline; sentiment is
not inferred from star ratings.

The review model follows the
[Google Business Profile Review resource](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews):
it retains Google's resource name, review ID, reviewer, star-rating enum,
timestamps, and optional reply and media fields. The internal `id`, `location`,
and `status` are Cubecca fields; local triage status is distinct from
Google's reply moderation state. Google identifiers are required by the app;
other source fields may be absent, including comments on rating-only reviews.

This storage is local to one server process and resets on restart or module
reload. It is not shared across instances and is not suitable for production.
A future database adapter can implement the repository contract.

## Review API

The API delegates to a service, repository, and workflow rather than accessing
mock data directly. All responses are JSON and uncached. POST requests require
`Content-Type: application/json`; when an Origin header is present it must
match the request host and protocol.

| Method and path | Body | Result |
| --- | --- | --- |
| `GET /api/reviews?status=pending` | — | `{ reviews }`; status is optional (`pending`, `approved`, `rejected`) |
| `GET /api/reviews/{reviewId}` | — | `{ review, timeline }` |
| `POST /api/reviews/{reviewId}/drafts` | `{}` or `{ "context": { "tone": "...", "businessContext": "..." } }` | `{ draft }` |
| `POST /api/reviews/{reviewId}/drafts/{draftId}/refine` | `{ "instruction": "...", "context": { "tone": "...", "businessContext": "..." } }` | `{ draft }`; context is optional |
| `POST /api/reviews/{reviewId}/approve` | `{ "draftId": "..." }` | `{ decision }` |
| `POST /api/reviews/{reviewId}/reject` | `{ "draftId": "..." }` | `{ decision }` |

Writes return 201 on success. Invalid requests return 400, missing reviews
return 404, stale drafts and invalid workflow transitions return 409, and
missing Gemini configuration returns 503. Errors use `{ "error": "..." }`.
Decisions are terminal, and refactoring or deciding against an outdated draft
is rejected. The prototype has no authentication or production security and
must not be exposed publicly.

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
