# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Local business owners and franchise operators who need to manage incoming
Google reviews while spending less time writing individual replies.

## Product Purpose

Review Pulse helps business owners respond to Google reviews efficiently. An AI
agent prepares a draft for the owner to read, approve, reject, or refine, so
owners can focus on the customer and the decision rather than starting each
reply from scratch. Success means less time spent composing replies while
maintaining timely, thoughtful responses and visibility into review
performance.

## Positioning

Review Pulse combines AI-generated review replies with a human approval step.
Drafts should reflect each business's configured tone and context; the owner
keeps control of what is sent.

## Operating Context

Owners triage reviews in an inbox, inspect the review and reply history, and
approve, reject, or refine an AI draft. The long-term product is intended to
support Google Business Profile reviews and business preferences across
locations. The current prototype uses seeded mock reviews.

## Capabilities and Constraints

- Current prototype: review inbox, draft/refinement workflow, and local demo
  decisions using mock data.
- Not implemented: Google Business Profile connection or publishing, account
  authentication, production data storage, and real multi-location sync.
- Product goals: ingest incoming reviews, prepare drafts using configurable
  tone and business context, and wait for owner approval before publishing.
- Planned workflows also include owner-directed refinement, rejection,
  notifications for drafts awaiting approval, and weekly review insights.
- The current approve/reject actions record demo decisions only; they do not
  publish to Google.

## Brand Commitments

The product name is Review Pulse. The experience should feel sleek, minimal,
and enterprise-level for small business owners, without generic or
AI-generated-looking presentation. Reply tone is a business preference and may
be casual, serious, or professional.

## Evidence on Hand

The repository includes seeded mock reviews and prototype UI captures under
`resources/`. Product and technical requirements are documented in
`resources/review_pulse_prd.md` and `resources/technical_requirements.md`.
There is no real customer, performance, or integration evidence in the
prototype; do not invent testimonials, outcome metrics, or claims that Google
publishing or authentication is live.

## Product Principles

- Keep the business owner in control of every published reply.
- Let the agent handle first-draft composition so owners can focus on review
  triage and decisions.
- Ground drafts in each business's chosen tone and context.
- Keep review decisions and reply history visible together.
- Help owners understand how their reviews are performing.
