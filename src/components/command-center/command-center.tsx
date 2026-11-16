"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LoaderCircle,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Search,
  Settings,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Review, ReviewStatus, StarRating, TimelineEvent } from "@/domain/reviews";
import { buttonVariants } from "@/components/ui/button";
import { BrandMark } from "@/components/illustrations/brand-mark";
import { ReviewApiError, reviewApi } from "@/lib/review-api";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 260, damping: 20 } as const;
const filters = [
  { status: "all", label: "All", icon: Inbox },
  { status: "pending", label: "Pending", icon: Clock3 },
  { status: "approved", label: "Approved", icon: CircleCheck },
  { status: "rejected", label: "Rejected", icon: CircleX },
] as const;
const starValues: Record<StarRating, number> = {
  STAR_RATING_UNSPECIFIED: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

type Detail = { review: Review; timeline: TimelineEvent[] };
type BusyAction = "generating" | "refactoring" | "approving" | "rejecting" | null;

function messageOf(error: unknown): string {
  return error instanceof ReviewApiError ? error.message : "Something went wrong. Please try again.";
}

function reviewerName(review: Review): string {
  return review.reviewer?.isAnonymous ? "Anonymous" : review.reviewer?.displayName || "Anonymous";
}

function relativeTime(value?: string): string {
  if (!value) return "Time unknown";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Time unknown";
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return format.format(seconds, "second");
  if (Math.abs(seconds) < 3600) return format.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return format.format(Math.round(seconds / 3600), "hour");
  return format.format(Math.round(seconds / 86400), "day");
}

function Stars({ rating }: { rating?: StarRating }) {
  const value = rating ? starValues[rating] : 0;
  return (
    <span className="rating" aria-label={value ? `${value} out of 5 stars` : "Rating unavailable"}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} aria-hidden="true" className={index < value ? "star-filled" : ""} />
      ))}
    </span>
  );
}

function Avatar({ review }: { review: Review }) {
  const name = reviewerName(review);
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <span className="review-avatar" aria-hidden="true">
      {!review.reviewer?.isAnonymous && review.reviewer?.profilePhotoUrl ? (
        <Image src={review.reviewer.profilePhotoUrl} width={42} height={42} alt="" unoptimized />
      ) : initials}
    </span>
  );
}

function ActionButton({
  children,
  className,
  disabled,
  onClick,
  type = "button",
  ariaExpanded,
  ariaControls,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaExpanded?: boolean;
  ariaControls?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type={type}
      className={cn(buttonVariants(), "workspace-button", className)}
      disabled={disabled}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      whileHover={disabled || reducedMotion ? undefined : { scale: 0.98 }}
      transition={spring}
    >
      {children}
    </motion.button>
  );
}

function ReviewWorkspace({
  reviewId,
  onDecision,
  onNotice,
}: {
  reviewId: string;
  onDecision: () => void;
  onNotice: (message: string) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [refactorOpen, setRefactorOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        let current = await reviewApi.get(reviewId);
        if (active) {
          setDetail(current);
          setLoading(false);
        }
        const hasDraft = current.timeline.some((event) => event.type === "draft");
        if (current.review.status !== "pending" || hasDraft) return;
        if (active) setBusy("generating");
        try {
          await reviewApi.generate(reviewId);
        } catch (generationError) {
          if (!(generationError instanceof ReviewApiError) || generationError.status !== 409) {
            throw generationError;
          }
          current = await reviewApi.get(reviewId);
          if (!current.timeline.some((event) => event.type === "draft")) throw generationError;
        }
        current = await reviewApi.get(reviewId);
        if (active) setDetail(current);
      } catch (loadError) {
        if (active) setError(messageOf(loadError));
      } finally {
        if (active) {
          setLoading(false);
          setBusy(null);
        }
      }
    }
    void load();
    return () => { active = false; };
  }, [reviewId, reloadToken]);

  const latestDraft = detail?.timeline.filter((event) => event.type === "draft").at(-1);
  const decision = detail?.timeline.find((event) => event.type === "decision");

  async function retryGeneration() {
    setError(null);
    setBusy("generating");
    try {
      await reviewApi.generate(reviewId);
      setDetail(await reviewApi.get(reviewId));
    } catch (retryError) {
      if (retryError instanceof ReviewApiError && retryError.status === 409) {
        try {
          const current = await reviewApi.get(reviewId);
          setDetail(current);
          if (current.timeline.some((event) => event.type === "draft")) return;
        } catch {
          setError("Could not refresh the review. Please try again.");
          return;
        }
      }
      setError(messageOf(retryError));
    } finally {
      setBusy(null);
    }
  }

  async function refactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!latestDraft || !instruction.trim()) return;
    setError(null);
    setBusy("refactoring");
    try {
      await reviewApi.refactor(reviewId, latestDraft.id, instruction.trim());
      setInstruction("");
      setRefactorOpen(false);
      onNotice("New draft ready for review.");
      try {
        setDetail(await reviewApi.get(reviewId));
      } catch {
        setError("Draft saved, but the timeline could not be refreshed. Select this review again.");
      }
    } catch (refactorError) {
      setError(messageOf(refactorError));
    } finally {
      setBusy(null);
    }
  }

  async function decide(action: "approve" | "reject") {
    if (!latestDraft) return;
    setError(null);
    setBusy(action === "approve" ? "approving" : "rejecting");
    try {
      await reviewApi.decide(reviewId, latestDraft.id, action);
      onDecision();
      onNotice(action === "approve" ? "Approved in demo. Nothing was sent to Google." : "Draft withdrawn in demo.");
      try {
        setDetail(await reviewApi.get(reviewId));
      } catch {
        setError("Decision saved, but the timeline could not be refreshed. Select this review again.");
      }
    } catch (decisionError) {
      setError(messageOf(decisionError));
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <div className="workspace-empty" role="status"><LoaderCircle className="spin" /> Loading review...</div>;
  }
  if (!detail) {
    return (
      <div className="workspace-empty" role="alert">
        <span className="workspace-empty-icon"><MessageSquare aria-hidden="true" /></span>
        <strong>{error ? "Review unavailable" : "Something went wrong"}</strong>
        <span>{error ?? "The review could not be loaded."}</span>
        <ActionButton onClick={() => { setError(null); setLoading(true); setReloadToken((value) => value + 1); }}>
          <RefreshCw /> Retry
        </ActionButton>
      </div>
    );
  }

  return (
    <section className="workspace" aria-label={`Review trace for ${reviewerName(detail.review)}`}>
      <header className="workspace-header">
        <div className="workspace-header-review">
          <Avatar review={detail.review} />
          <div className="workspace-heading">
            <h1>{reviewerName(detail.review)}</h1>
            <p>Google review <span>·</span> {detail.review.location.name} <span>·</span> Review trace</p>
          </div>
        </div>
        <span className={cn("workspace-status", `workspace-status-${detail.review.status}`)}>
          {detail.review.status === "pending"
            ? "Awaiting your decision"
            : detail.review.status === "approved"
              ? "Approved in demo"
              : "Draft withdrawn"}
        </span>
      </header>
      <div className="workspace-body">
        <p className="demo-note">
          <span className="demo-label">Demo</span>
          Sample data only. Decisions are recorded in this prototype; replies
          are not sent to Google.
        </p>
        <ol className="trace-list">
          <li className="trace-item">
            <span className="trace-marker"><MessageSquare aria-hidden="true" /></span>
            <article className="trace-card">
              <div className="trace-card-heading"><span>Customer review</span><time>{relativeTime(detail.review.createTime)}</time></div>
              <div className="customer-heading">
                <Avatar review={detail.review} />
                <div><strong>{reviewerName(detail.review)}</strong><Stars rating={detail.review.starRating} /></div>
              </div>
              <p>{detail.review.comment || "No written review."}</p>
            </article>
          </li>
          <AnimatePresence initial={false}>
            {detail.timeline.filter((event) => event.type !== "decision").map((event) => (
              <motion.li
                key={event.id}
                className="trace-item"
                initial={reducedMotion ? false : { opacity: 0, y: event.type === "draft" ? 16 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
              >
                <span className={cn("trace-marker", event.type === "draft" && event.id === latestDraft?.id && "trace-marker-active")}>
                  {event.type === "draft" ? <Sparkles aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />}
                </span>
                <article className={cn("trace-card", event.type === "feedback" && "trace-card-feedback", event.type === "draft" && event.id === latestDraft?.id && "trace-card-latest")}>
                  <div className="trace-card-heading">
                    <span>{event.type === "draft" ? `Agent draft v${event.version}` : "Human feedback"}</span>
                    <div className="trace-card-meta">
                      {event.type === "draft" && event.id === latestDraft?.id && (
                        <span className="draft-state">Latest draft</span>
                      )}
                      {event.type === "draft" && event.id !== latestDraft?.id && (
                        <span className="draft-state">Superseded</span>
                      )}
                      <time>{relativeTime(event.createdAt)}</time>
                    </div>
                  </div>
                  <p>{event.content}</p>
                  {event.type === "draft" && event.id === latestDraft?.id && (
                    decision ? (
                      <motion.div
                        className={cn("terminal-badge", `terminal-${decision.status}`)}
                        initial={reducedMotion ? false : { y: 8, scale: 0.95, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        transition={spring}
                      >
                        {decision.status === "approved" ? <CircleCheck /> : <CircleX />}
                        {decision.status === "approved" ? "Approved in demo · not sent" : "Draft withdrawn"}
                      </motion.div>
                    ) : (
                      <>
                        <div className="workspace-actions">
                          <ActionButton className="approve-button" disabled={busy !== null} onClick={() => void decide("approve")}>
                            {busy === "approving" ? <LoaderCircle className="spin" /> : <Check />} Approve
                          </ActionButton>
                          <ActionButton className="reject-button" disabled={busy !== null} onClick={() => void decide("reject")}>
                            {busy === "rejecting" ? <LoaderCircle className="spin" /> : <X />} Reject
                          </ActionButton>
                          <ActionButton
                            className="outline-button"
                            disabled={busy !== null}
                            ariaExpanded={refactorOpen}
                            ariaControls={refactorOpen ? "refactor-form" : undefined}
                            onClick={() => setRefactorOpen((open) => !open)}
                          >
                            <RefreshCw /> Refine draft
                          </ActionButton>
                        </div>
                        <AnimatePresence initial={false}>
                          {refactorOpen && (
                            <motion.form
                              id="refactor-form"
                              className="refactor-form"
                              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                              transition={spring}
                              onSubmit={(formEvent) => void refactor(formEvent)}
                            >
                              <label htmlFor="refactor-instruction">What would you like the agent to change?</label>
                              <textarea
                                id="refactor-instruction"
                                value={instruction}
                                onChange={(inputEvent) => setInstruction(inputEvent.target.value)}
                                placeholder="For example: Make this shorter and more empathetic."
                                maxLength={4000}
                                disabled={busy !== null}
                                required
                              />
                              <div className="refactor-actions">
                                <ActionButton className="outline-button" disabled={busy !== null} onClick={() => setRefactorOpen(false)}>Cancel</ActionButton>
                                <ActionButton type="submit" disabled={busy !== null || !instruction.trim()}>
                                  {busy === "refactoring" ? <LoaderCircle className="spin" /> : <Send />} Send instruction
                                </ActionButton>
                              </div>
                            </motion.form>
                          )}
                        </AnimatePresence>
                      </>
                    )
                  )}
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
          {busy === "generating" && (
            <li className="trace-item">
              <span className="trace-marker"><Sparkles aria-hidden="true" /></span>
              <div className="trace-card trace-loading" role="status"><LoaderCircle className="spin" /> The agent is drafting a response...</div>
            </li>
          )}
        </ol>
        {error && (
          <div className="workspace-error" role="alert">
            {error}
            <button type="button" disabled={busy !== null} onClick={() => { setError(null); setLoading(true); setReloadToken((value) => value + 1); }}>
              Refresh review
            </button>
          </div>
        )}
        {!latestDraft && busy !== "generating" && detail.review.status === "pending" && (
          <ActionButton className="retry-button" onClick={() => void retryGeneration()}><RefreshCw /> Try generating again</ActionButton>
        )}
      </div>
    </section>
  );
}

export function CommandCenter() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const reducedMotion = useReducedMotion();

  const refresh = useCallback(async () => {
    try {
      const response = await reviewApi.list();
      setReviews(response.reviews);
      setError(null);
    } catch (loadError) {
      setError(messageOf(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    reviewApi.list()
      .then((response) => { if (active) setReviews(response.reviews); })
      .catch((loadError: unknown) => { if (active) setError(messageOf(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function selectReview(id: string | null) {
    setSelectedId(id);
  }

  function onDecision() {
    void refresh();
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus = filter === "all" || review.status === filter;
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchesQuery =
      !query ||
      reviewerName(review).toLocaleLowerCase().includes(query) ||
      (review.comment ?? "").toLocaleLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
  const locationName = reviews[0]?.location.name;

  return (
    <main className="command-center">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <Link className="sidebar-brand" href="/">
          <BrandMark />
          <span className="sidebar-brand-copy">
            <strong>Review Pulse</strong>
            <small>{locationName ?? "Demo workspace"}</small>
          </span>
          <ChevronDown className="sidebar-brand-chevron" aria-hidden="true" />
        </Link>
        <span className="sidebar-label">Menu</span>
        <nav className="sidebar-nav">
          <Link className="sidebar-link" href="/dashboard">
            <LayoutDashboard aria-hidden="true" /><span>Dashboard</span>
          </Link>
          <Link className="sidebar-link sidebar-link-active" href="/command-center" aria-current="page">
            <MessageSquare aria-hidden="true" /><span>Reviews</span><b>{reviews.length}</b>
          </Link>
          <span className="sidebar-link sidebar-link-disabled" aria-disabled="true">
            <MapPin aria-hidden="true" /><span>Locations</span><small>Soon</small>
          </span>
        </nav>
        <span className="sidebar-label sidebar-label-workspace">Workspace</span>
        <nav className="sidebar-nav">
          <span className="sidebar-link sidebar-link-disabled" aria-disabled="true">
            <Settings aria-hidden="true" /><span>Settings</span><small>Soon</small>
          </span>
        </nav>
        <div className="sidebar-profile">
          <span className="profile-initials">DP</span>
          <span><strong>Demo owner</strong><small>Profile preview</small></span>
          <span className="profile-menu" aria-hidden="true">···</span>
        </div>
      </aside>

      <div className="command-main">
        <header className="app-topbar">
          <Link className="mobile-brand" href="/">
            <BrandMark />
            Review Pulse
          </Link>
          <div className="breadcrumb">
            <Inbox aria-hidden="true" />
            <span>Reviews</span><b>/</b><strong>Inbox</strong>
          </div>
          <label className="global-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reviews"
              aria-label="Search reviews"
            />
          </label>
          <div className="topbar-status">
            <span className="demo-indicator"><i /> Demo mode</span>
            <span className="toolbar-avatar" aria-label="Demo owner">DP</span>
          </div>
        </header>

        <div className="command-content">
          <section className="review-inbox" aria-label="Review inbox">
            <header className="inbox-header">
              <div className="inbox-title-row">
                <h1>Inbox</h1>
                <span>{filteredReviews.length}</span>
              </div>
              <div className="inbox-filters" aria-label="Filter reviews by status">
                {filters.map(({ status, label, icon: Icon }) => (
                  <button
                    key={status}
                    type="button"
                    className={cn("inbox-filter", filter === status && "inbox-filter-active")}
                    aria-pressed={filter === status}
                    onClick={() => { setFilter(status); selectReview(null); }}
                  >
                    {label} <b>{status === "all" ? reviews.length : reviews.filter((review) => review.status === status).length}</b>
                    <Icon aria-hidden="true" />
                  </button>
                ))}
              </div>
            </header>
            {loading ? (
              <div className="inbox-empty" role="status"><LoaderCircle className="spin" /> Loading reviews...</div>
            ) : error ? (
              <div className="inbox-empty" role="alert">{error} <button type="button" onClick={() => void refresh()}>Retry</button></div>
            ) : filteredReviews.length === 0 ? (
              <div className="inbox-empty">
                <Inbox />
                {searchQuery.trim()
                  ? "No reviews match your search."
                  : `No ${filter === "all" ? "" : `${filter} `}reviews.`}
              </div>
            ) : (
              <ul className="inbox-list">
                {filteredReviews.map((review) => (
                  <li key={review.id}>
                    <button
                      type="button"
                      className={cn("inbox-review", selectedId === review.id && "inbox-review-selected")}
                      aria-pressed={selectedId === review.id}
                      onClick={() => selectReview(review.id)}
                    >
                      <span className="inbox-review-content">
                        <span className="inbox-review-heading"><strong>{reviewerName(review)}</strong><time>{relativeTime(review.createTime)}</time></span>
                        <Stars rating={review.starRating} />
                        <span className="review-snippet">{review.comment || "No written review."}</span>
                        <AnimatePresence initial={false} mode="wait">
                          <motion.span
                            key={review.status}
                            className={cn("review-status", `review-status-${review.status}`)}
                            initial={reducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? undefined : { opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >{review.status}</motion.span>
                        </AnimatePresence>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {selectedId ? (
            <ReviewWorkspace key={selectedId} reviewId={selectedId} onDecision={onDecision} onNotice={setNotice} />
          ) : (
            <div className="workspace-empty">
              <span className="workspace-empty-icon"><MessageSquare aria-hidden="true" /></span>
              <strong>Choose a review to begin</strong>
              <span>Read the customer&apos;s words, review the draft, and make the final call.</span>
              <p className="workspace-empty-note">Select a pending review to ask the agent for a first draft.</p>
            </div>
          )}
          <aside className="details-panel" aria-label="Additional review details">
            <header><h2>Details</h2></header>
            <div className="details-coming-soon">
              <span><LockKeyhole aria-hidden="true" /></span>
              <strong>Coming soon</strong>
            </div>
          </aside>
        </div>

        <div className="toast-region" aria-live="polite">
          <AnimatePresence initial={false}>
            {notice && <motion.div key={notice} className="toast" initial={reducedMotion ? false : { y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reducedMotion ? undefined : { y: -8, opacity: 0 }} transition={spring}><CircleCheck aria-hidden="true" /> {notice}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X /></button></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
