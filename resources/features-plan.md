# Cubecca: Features Plan

Items needed to turn the current designs into a full product. Auth is Google-only (no email or multi-factor), so related items below are scoped to that.

Status key: `[design]` screen designed, `[todo]` not started.

## 1. Accounts and access
- [design] **Sign up, log in and log out with Google:** one Google button for all three, no passwords.
- [todo] **Team management:** invite, remove and manage people in a business workspace.
- [todo] **Roles and permissions:** Owner, Manager and Reviewer, controlling who can approve, reject or publish.
- [todo] **Session and device management:** see and revoke active logins.
- [todo] **Audit log:** a record of who approved, rejected or changed what, and when.
- [todo] **Workspace switcher:** make the sidebar business picker work for owners and agencies with several businesses.
- [todo] **Profile page:** name, photo and preferences for the signed-in user.

## 2. Google integration
- [todo] **Google Business Profile API approval:** Google must approve the app and its data scopes before real review access; this can take weeks.
- [todo] **OAuth connect and reconnect:** link an account, handle expired tokens and prompt to reconnect when access breaks.
- [todo] **Location picker:** choose which Google locations to manage.
- [todo] **Review sync:** pull new reviews on a schedule or by push, and backfill history on first connect.
- [todo] **Reply publishing:** post, edit and delete replies on Google, with a clear "failed to publish, retry" state.
- [todo] **Handling customer changes:** update or flag reviews the customer edits or deletes, and replies edited on Google directly.
- [todo] **Rating-only reviews:** handle reviews that have stars but no text.
- [todo] **API quota and rate-limit handling:** queue and back off so Google limits don't break publishing.
- [todo] **Disconnect and data cleanup:** remove access and decide what happens to stored reviews.

## 3. AI agent and drafting
- [todo] **Brand voice settings:** tone presets, sign-off, do and don't phrases, and language style per business.
- [todo] **Business knowledge base:** menu, hours, policies, manager names and FAQs the agent can use.
- [todo] **Per-rating rules:** different handling for 1-star complaints, 3-star mixed reviews and 5-star praise.
- [todo] **Multilingual replies:** detect the review language and reply in it.
- [todo] **Guardrails:** banned words, no refunds or promises, no medical or legal claims, no personal data in replies.
- [todo] **Prompt-injection defense:** treat review text as untrusted so a customer can't instruct the agent.
- [todo] **Escalation rules:** flag legal threats, health complaints, discrimination and fake or spam reviews for a person.
- [todo] **Manual draft editing:** edit the text directly, not only through refactor instructions.
- [todo] **Draft history and compare:** view and restore earlier versions side by side.
- [todo] **Saved replies and templates:** reusable responses for common situations.
- [todo] **Autopilot with thresholds:** optional auto-approval for safe cases, such as 5-star reviews, with a person still in control.
- [todo] **Agent failure handling:** visible errors, retries and a manual fallback when a draft can't be generated.
- [todo] **Quality evaluation:** test sets and scoring to check draft quality before changing prompts or models.
- [todo] **Prompt and model versioning:** know which version produced each draft.
- [todo] **Usage and cost tracking:** tokens and cost per review, workspace and plan.

## 3b. Inbox and workflow
- [design] **Inbox with status filters and trace timeline:** Pending, Approved and Rejected, with the full trace for each review.
- [todo] **Search, filters and sorting:** by rating, sentiment, status, location, date and keyword.
- [todo] **Saved views:** such as "negative and pending".
- [todo] **Bulk actions:** approve, reject or tag many reviews at once.
- [todo] **Assignment:** give a review to a specific team member.
- [todo] **Tags and labels:** custom categories, such as "food" or "service".
- [todo] **Internal notes and comments:** discuss a review before replying, with @mentions.
- [todo] **Due dates and stale alerts:** a response goal and warnings for reviews left pending too long.
- [todo] **Snooze and archive:** park reviews without deleting them.
- [todo] **Real-time updates:** new reviews and teammates' actions appear without refreshing.
- [todo] **Conflict handling:** stop two people approving or rejecting the same review at once.
- [todo] **Undo window:** a short chance to reverse an approve or reject before it publishes.
- [todo] **Pagination and long-list performance:** support businesses with thousands of reviews.
- [todo] **Details panel content:** fill the "Coming soon" panel with review, location, sentiment and activity information.
- [todo] **Loading, empty and error states:** for every list, panel and action.

## 4. Notifications
- [todo] **Email alerts:** new review, draft ready and publish failed.
- [todo] **Chat alerts:** Slack, Microsoft Teams or WhatsApp notifications.
- [todo] **Push and in-app notification center:** a list of recent events.
- [todo] **Digest emails:** a daily or weekly summary of pending items and activity.
- [todo] **Notification preferences:** choose what to receive, where and how often.

## 5. Analytics and reporting
- [design] **Dashboard:** stat tiles (rating, new reviews, response rate, pending) plus reviews over time and a needs-attention list.
- [todo] **Response metrics:** time to reply, approval rate and how often drafts are edited.
- [todo] **Sentiment and topic trends:** what customers praise or complain about, over time.
- [todo] **Location comparison:** compare branches for multi-location businesses.
- [todo] **Competitor benchmarking:** compare ratings and volume against nearby businesses.
- [todo] **Exports and scheduled reports:** CSV or PDF, delivered by email on a schedule.

## 6. Onboarding
- [todo] **Setup wizard:** connect Google, pick locations and set brand voice in a few steps.
- [todo] **Sample data and demo mode:** try the product before connecting a real account.
- [todo] **First-draft moment:** show a real draft quickly to prove value.
- [todo] **Product tour and checklist:** guide new users to approve their first reply.
- [todo] **Empty-account states:** what the inbox looks like before any reviews arrive.

## 7. Settings
- [todo] **Workspace settings:** name, logo, time zone, language and business details.
- [todo] **Location management:** add, remove and configure locations.
- [todo] **Integrations page:** connected accounts and their status.
- [todo] **API keys and webhooks:** let customers connect their own tools.
- [todo] **Data retention controls:** how long reviews and traces are kept.
- [todo] **Account export and deletion:** download all data and delete an account.

## 8. Billing and plans
- [todo] **Pricing and plans:** tiers based on locations, seats or reviews per month.
- [todo] **Checkout and subscriptions:** card payments, upgrades, downgrades and cancellation.
- [todo] **Free trial:** start, end and conversion flow.
- [todo] **Invoices and tax:** receipts, and GST invoices for Indian customers.
- [todo] **Usage limits and overage handling:** what happens when a plan limit is reached.
- [todo] **Failed payment handling:** retries, reminder emails and a grace period.
- [todo] **Coupons and referrals:** discounts and invite rewards.

## 9. Marketing site
- [design] **Landing page:** hero, animated workflow, feature tiles and calls to action.
- [design] **404 page:** playful animated "page not found" screen.
- [todo] **Pricing page:** show the plans.
- [todo] **Docs and help center:** setup guides, FAQs and troubleshooting.
- [todo] **Case studies and testimonials:** real customer proof for the landing page.
- [todo] **Blog and changelog:** content and product updates.
- [todo] **Demo booking and contact:** a form or scheduler for the "Book a demo" button.
- [todo] **SEO and sharing previews:** page titles, descriptions and social images.
- [todo] **Cookie consent and site analytics:** tracking that respects privacy rules.

## 10. Legal and compliance
- [todo] **Terms of service and privacy policy:** required before launch.
- [todo] **Cookie policy:** needed if you use tracking or analytics.
- [todo] **Data processing agreement:** for business customers.
- [todo] **Google API data-use compliance:** Google's rules for apps that handle user data, including a security review for sensitive access.
- [todo] **India DPDP Act and GDPR readiness:** consent, data deletion and data-subject requests.
- [todo] **AI disclosure and sub-processor list:** state that AI drafts replies and which vendors process data.
- [todo] **Security certifications later:** SOC 2 or ISO 27001 when selling to larger businesses.

## 11. Platform and infrastructure
- [todo] **Multi-tenant data model:** keep each business's data strictly separate.
- [todo] **Background job queue:** reliable syncs, drafts and publishing, with retries and no duplicate posts.
- [todo] **Token and secret encryption:** safe storage of Google access tokens.
- [todo] **Rate limiting and abuse protection:** guard against bots and runaway usage.
- [todo] **Input sanitization:** safely display untrusted review text.
- [todo] **Logging, tracing and error tracking:** see what the agent did and why something failed.
- [todo] **Staging, production and CI/CD:** safe releases with automated checks.
- [todo] **Backups and disaster recovery:** restore data after an incident.
- [todo] **Feature flags:** release changes gradually.
- [todo] **Admin console:** internal tool to view accounts, retry jobs and support customers.
- [todo] **Testing:** automated unit and end-to-end tests, plus load testing.

## 12. Support and operations
- [todo] **In-app help and chat:** a way to ask for help while using the product.
- [todo] **Feedback widget and feature requests:** collect ideas inside the app.
- [todo] **Status page:** public uptime and incident updates.
- [todo] **Support impersonation:** a controlled way to view an account for debugging, with an audit trail.
- [todo] **Transactional email templates:** invites, alerts and receipts in your brand style (no password emails needed with Google-only auth).

## 13. Design and UX gaps
- [todo] **Responsive and mobile layout:** make the three-panel workspace usable on a phone, or build a mobile app.
- [todo] **Accessibility pass:** contrast, keyboard use, screen readers and focus states.
- [todo] **Dark mode:** currently light only by design, so this is a later decision.
- [todo] **Localization:** translated interface and local date, time and currency formats.
- [todo] **Command palette and shortcuts:** make the ⌘K search in the top bar work.
- [todo] **Component documentation:** a shared library of buttons, badges, toasts and states.
- [todo] **Remaining screen states:** "Rejected", "failed to publish" and "sync paused" screens.

## 14. Growth and extensions
- [todo] **More review sources:** Yelp, Facebook, TripAdvisor, Zomato and Justdial.
- [todo] **Review request campaigns:** QR codes, SMS and email asking happy customers to review.
- [todo] **Website review widget:** show good reviews on the customer's own site.
- [todo] **Public API and Zapier:** connect to CRMs, POS and other tools.
- [todo] **Agency and white-label mode:** manage many client businesses under one account.
- [todo] **Reputation score:** a single measure of how a business is doing.

## Suggested first priorities
1. Google Business Profile API approval.
2. Token and secret encryption.
3. Prompt-injection defense.
4. Background job queue with retries and no duplicate posts.
