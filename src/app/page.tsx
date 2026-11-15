import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Inbox,
  Pencil,
} from "lucide-react";
import { MotionLink } from "@/components/landing/motion-link";
import { ProductPreview } from "@/components/landing/product-preview";
import "./landing.css";

const steps = [
  {
    title: "The agent drafts",
    description:
      "Start with a thoughtful first reply instead of a blank page.",
  },
  {
    title: "You steer",
    description:
      "Ask for a change in plain English, or approve the reply as written.",
  },
  {
    title: "You decide",
    description:
      "The final call stays yours. This preview records demo decisions; it does not publish to Google.",
  },
];

const features = [
  {
    icon: Inbox,
    title: "One clear review queue",
    description:
      "Sort reviews by status and quickly see the rating, comment, and arrival time.",
  },
  {
    icon: Pencil,
    title: "A reply you can shape",
    description:
      "Give the agent a short instruction to make a draft warmer, clearer, or more concise.",
  },
  {
    icon: Check,
    title: "You make the final call",
    description:
      "Keep the review, draft versions, and your decision together in one trace.",
  },
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Review Pulse home">
      <span className="brand-mark">
        <Activity aria-hidden="true" size={18} strokeWidth={2.2} />
      </span>
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
        <MotionLink href="/command-center" size="small">
          Open demo
          <ArrowRight aria-hidden="true" />
        </MotionLink>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title" className="display-heading hero-title">
              Answer every review.
              <br />
              <em>Publish nothing</em> without your say.
            </h1>
            <p className="hero-description">
              An always-on AI assistant for your review inbox, designed to
              prepare thoughtful first replies around your business. You decide
              what happens next.
            </p>
            <div className="hero-actions">
              <MotionLink href="/command-center">
                Open demo <ArrowRight aria-hidden="true" />
              </MotionLink>
              <MotionLink href="#how-it-works" variant="outline">
                See how it works <ArrowDown aria-hidden="true" />
              </MotionLink>
            </div>
            <p className="hero-note">
              <span className="status-dot" aria-hidden="true" />
              Concept preview. Sample reviews only; Google sync and publishing
              are not connected.
            </p>
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
          <h2 className="display-heading section-heading">
            Less time writing. More room to decide.
          </h2>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="feature-item" key={title}>
                <span className="feature-icon">
                  <Icon aria-hidden="true" size={17} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="control" className="content-section page-width">
          <div className="control-card">
            <div>
              <h2 className="display-heading">The agent writes. You decide.</h2>
              <p>
                Drafts are a starting point, not an automatic send. Your
                business keeps the final say on every response.
              </p>
            </div>
            <ul className="control-list">
              <li><Check aria-hidden="true" /> A person reviews every draft</li>
              <li><Check aria-hidden="true" /> Shape replies with your own guidance</li>
              <li><Check aria-hidden="true" /> Keep the decision beside the review</li>
            </ul>
          </div>
        </section>

        <section className="closing page-width">
          <h2 className="display-heading">
            Your next review deserves a great reply.
          </h2>
          <MotionLink href="#top">
            Back to top <ArrowUp aria-hidden="true" />
          </MotionLink>
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
