import {
  Activity,
  Check,
  ClipboardList,
  GitBranch,
  Inbox,
  Pencil,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MotionLink } from "@/components/landing/motion-link";
import { ProductPreview } from "@/components/landing/product-preview";
import "./landing.css";

const steps = [
  {
    title: "The agent drafts",
    description:
      "A new review arrives and an AI agent writes a first reply in your voice.",
  },
  {
    title: "You steer",
    description:
      "Approve it as is, reject it, or refactor it with a few words of instruction.",
  },
  {
    title: "It goes live",
    description:
      "Once you approve, the reply is ready to be published to Google Maps.",
  },
];

const features = [
  {
    icon: Inbox,
    title: "One inbox for every review",
    description:
      "See who wrote it, the rating, a snippet, and how long ago it arrived.",
  },
  {
    icon: GitBranch,
    title: "A trace for every reply",
    description:
      "See the full loop: the customer, the first draft, your feedback, and the latest draft.",
  },
  {
    icon: Pencil,
    title: "Refactor in plain English",
    description:
      "Tell the agent what to change and get a new version that reflects your feedback.",
  },
  {
    icon: Check,
    title: "Approve with confidence",
    description:
      "Review every reply before it is sent. Nothing reaches your customers without your say.",
  },
  {
    icon: X,
    title: "Reject without regret",
    description:
      "Withdraw a draft you do not want and keep the decision in the review trace.",
  },
  {
    icon: ClipboardList,
    title: "A record of the process",
    description:
      "Keep the review, feedback, and decision together so you can see what happened.",
  },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Review Pulse home">
      <Activity aria-hidden="true" size={19} strokeWidth={2.2} />
      <span>Review Pulse</span>
    </a>
  );
}

export default function Home() {
  return (
    <div id="top">
      <header className="site-header page-width">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#control">Control</a>
        </nav>
        <MotionLink href="#how-it-works" size="small">
          Explore the concept
        </MotionLink>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <Badge variant="outline" className="hero-badge">
            <span className="status-dot" aria-hidden="true" />
            AI replies for Google Maps, approved by you
          </Badge>
          <h1 id="hero-title" className="display-heading hero-title">
            Answer every review.
            <br />
            <em>Publish nothing</em> without your say.
          </h1>
          <p className="hero-description">
            Review Pulse helps you draft a thoughtful reply to each Google Maps
            review. You approve it, reject it, or steer it.
          </p>
          <div className="hero-actions">
            <MotionLink href="#how-it-works">See how it works</MotionLink>
            <MotionLink href="#features" variant="outline">
              Explore features
            </MotionLink>
          </div>
          <ProductPreview />
        </section>

        <section id="how-it-works" className="content-section page-width">
          <h2 className="display-heading section-heading">
            From a new review to a published
            <br className="desktop-break" /> reply in three moves.
          </h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step" key={step.title}>
                <span className="step-number">0{index + 1}</span>
                <h3 className="display-heading">{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="content-section page-width">
          <h2 className="display-heading section-heading centered">
            Everything you need to reply well.
          </h2>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <Card className="feature-card" key={title}>
                <span className="feature-icon">
                  <Icon aria-hidden="true" size={17} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="control" className="content-section page-width">
          <Card className="control-card">
            <div>
              <h2 className="display-heading">The agent writes. You decide.</h2>
              <p>
                Nothing reaches your customers on its own. Every reply waits
                for a person to decide what happens next.
              </p>
            </div>
            <ul className="control-list">
              <li><Check aria-hidden="true" /> Drafts wait for human action</li>
              <li><Check aria-hidden="true" /> Refactor with your own instructions</li>
              <li><Check aria-hidden="true" /> Decisions stay in the review trace</li>
            </ul>
          </Card>
        </section>

        <section className="closing page-width">
          <h2 className="display-heading">
            Your next review deserves a great reply.
          </h2>
          <MotionLink href="#top">Back to top</MotionLink>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-content">
          <Brand />
          <p>Concept preview. Not affiliated with Google.</p>
        </div>
      </footer>
    </div>
  );
}
