"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  Inbox,
  LoaderCircle,
  MessageSquare,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Review, ReviewStatus, StarRating, TimelineEvent } from "@/domain/reviews";
import { buttonVariants } from "@/components/ui/button";
import { ReviewApiError, reviewApi } from "@/lib/review-api";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 260, damping: 20 } as const;
const filters = [
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
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type={type}
      className={cn(buttonVariants(), "workspace-button", className)}
      disabled={disabled}
      onClick={onClick}
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
  onDecision: (reviewId: string, status: "approved" | "rejected") => void;
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
      const { decision: result } = await reviewApi.decide(reviewId, latestDraft.id, action);
      onDecision(reviewId, result.status);
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
        {error ?? "Review unavailable."}
        <ActionButton onClick={() => { setError(null); setLoading(true); setReloadToken((value) => value + 1); }}>
          <RefreshCw /> Retry
        </ActionButton>
      </div>
    );
  }

  return (
    <section className="workspace" aria-label={`Review trace for ${reviewerName(detail.review)}`}>
      <header className="workspace-header">
        <h1>Review trace <span>·</span> {reviewerName(detail.review)}</h1>
        <span>Google Maps · {detail.review.location.name}</span>
      </header>
      <div className="workspace-body">
        <p className="demo-note">Demo mode: decisions are saved locally and never sent to Google. AI drafts may contain inaccurate claims; review them carefully.</p>
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
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
              >
                <span className={cn("trace-marker", event.type === "draft" && event.id === latestDraft?.id && "trace-marker-active")}>
                  {event.type === "draft" ? <Sparkles aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />}
                </span>
                <article className="trace-card">
                  <div className="trace-card-heading">
                    <span>{event.type === "draft" ? `Agent draft v${event.version}` : "Human feedback"}</span>
                    <time>{relativeTime(event.createdAt)}</time>
                  </div>
                  <p className={event.type === "feedback" ? "feedback-content" : undefined}>{event.content}</p>
                  {event.type === "draft" && event.id === latestDraft?.id && (
                    decision ? (
                      <div className={cn("terminal-badge", `terminal-${decision.status}`)}>
                        {decision.status === "approved" ? <CircleCheck /> : <CircleX />}
                        {decision.status === "approved" ? "Approved in demo · not sent" : "Draft withdrawn"}
                      </div>
                    ) : (
                      <>
                        <div className="workspace-actions">
                          <ActionButton className="approve-button" disabled={busy !== null} onClick={() => void decide("approve")}>
                            {busy === "approving" ? <LoaderCircle className="spin" /> : <Check />} Approve
                          </ActionButton>
                          <ActionButton className="reject-button" disabled={busy !== null} onClick={() => void decide("reject")}>
                            {busy === "rejecting" ? <LoaderCircle className="spin" /> : <X />} Reject
                          </ActionButton>
                          <ActionButton className="outline-button" disabled={busy !== null} onClick={() => setRefactorOpen((open) => !open)}>
                            <RefreshCw /> Refactor
                          </ActionButton>
                        </div>
                        <AnimatePresence initial={false}>
                          {refactorOpen && (
                            <motion.form
                              className="refactor-form"
                              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                              transition={spring}
                              onSubmit={(formEvent) => void refactor(formEvent)}
                            >
                              <label htmlFor="refactor-instruction">Instructions for the agent</label>
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
                                  {busy === "refactoring" ? <LoaderCircle className="spin" /> : <Send />} Send to agent
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
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function selectReview(id: string | null) {
    selectedRef.current = id;
    setSelectedId(id);
  }

  function onDecision(reviewId: string, status: "approved" | "rejected") {
    if (selectedRef.current === reviewId) setFilter(status);
    void refresh();
  }

  return (
    <main className="command-center">
      <aside className="review-inbox" aria-label="Review inbox">
        <header className="inbox-header">
          <Link className="inbox-brand" href="/"><Activity aria-hidden="true" /> Review Pulse</Link>
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Home</Link>
          <p>Review inbox <span>· Demo</span></p>
          <div className="inbox-filters" aria-label="Filter reviews by status">
            {filters.map(({ status, label, icon: Icon }) => (
              <button
                key={status}
                type="button"
                className={cn("inbox-filter", `filter-${status}`, filter === status && "filter-active")}
                aria-pressed={filter === status}
                onClick={() => { setFilter(status); selectReview(null); }}
              >
                <Icon aria-hidden="true" /> {label} <strong>{reviews.filter((review) => review.status === status).length}</strong>
              </button>
            ))}
          </div>
        </header>
        {loading ? (
          <div className="inbox-empty" role="status"><LoaderCircle className="spin" /> Loading reviews...</div>
        ) : error ? (
          <div className="inbox-empty" role="alert">{error} <button type="button" onClick={() => void refresh()}>Retry</button></div>
        ) : reviews.filter((review) => review.status === filter).length === 0 ? (
          <div className="inbox-empty"><Inbox /> No {filter} reviews.</div>
        ) : (
          <ul className="inbox-list">
            {reviews.filter((review) => review.status === filter).map((review) => (
              <li key={review.id}>
                <button
                  type="button"
                  className={cn("inbox-review", selectedId === review.id && "inbox-review-selected")}
                  aria-pressed={selectedId === review.id}
                  onClick={() => selectReview(review.id)}
                >
                  <Avatar review={review} />
                  <span className="inbox-review-content">
                    <span className="inbox-review-heading"><strong>{reviewerName(review)}</strong><time>{relativeTime(review.createTime)}</time></span>
                    <Stars rating={review.starRating} />
                    <span className="review-snippet">{review.comment || "No written review."}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      {selectedId ? (
        <ReviewWorkspace key={selectedId} reviewId={selectedId} onDecision={onDecision} onNotice={setNotice} />
      ) : (
        <div className="workspace-empty"><MessageSquare /><strong>Select a review</strong><span>Choose a pending review to generate an AI draft.</span></div>
      )}
      <div className="toast-region" aria-live="polite">
        {notice && <div className="toast"><CircleCheck aria-hidden="true" /> {notice}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X /></button></div>}
      </div>
    </main>
  );
}
