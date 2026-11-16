import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
} from "lucide-react";
import { MotionLink } from "@/components/landing/motion-link";
import { ProductPreview } from "@/components/landing/product-preview";
import { CubeMark, WorkflowDiagram } from "@/components/landing/illustrations";
import { BrandMark } from "@/components/illustrations/brand-mark";
import "./landing.css";

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Review Pulse home">
      <BrandMark />
      <span>Review Pulse</span>
    </a>
  );
}

export default function Home() {
  return (
    <div id="top" className="landing-page">
      <header className="site-header page-width">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#workflow">Workflow</a>
          <a href="#features">Features</a>
          <a href="#control">Control</a>
          <a href="/login">Log in</a>
        </nav>
        <MotionLink href="/command-center" size="small">
          Open demo
          <ArrowRight aria-hidden="true" />
        </MotionLink>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <CubeMark
            className="hero-cube hero-cube-left"
            variant="star"
          />
          <CubeMark
            className="hero-cube hero-cube-right"
            variant="check"
            delay={1.4}
          />
          <div className="hero-copy">
            <h1 id="hero-title" className="display-heading hero-title">
              Thoughtful replies.
              <br />
              <em>Nothing sent unseen.</em>
            </h1>
            <p className="hero-description">
              Pulse prepares a first reply for your review. Refine it in your
              own words, then make the call yourself.
            </p>
            <div className="hero-actions">
              <MotionLink href="/command-center">
                Open demo <ArrowRight aria-hidden="true" />
              </MotionLink>
              <MotionLink href="#workflow" variant="outline">
                See the workflow <ArrowDown aria-hidden="true" />
              </MotionLink>
            </div>
          </div>
        </section>

        <WorkflowDiagram />

        <section className="preview-section page-width" aria-label="Product preview">
          <ProductPreview />
        </section>

        <section id="features" className="content-section page-width">
          <h2 className="display-heading section-heading">
            Built around the one thing that matters: a thoughtful reply.
          </h2>
          <div className="feature-grid">
            <article className="feature-item feature-trace">
              <div className="feature-visual trace-visual" aria-hidden="true">
                <span><i /> Customer review <time>10:42</time></span>
                <span><i /> Pulse analysis <time>complete</time></span>
                <span><i /> Agent draft v1 <time>superseded</time></span>
                <span><i /> Your feedback <time>10:51</time></span>
                <span className="trace-visual-latest"><i /> Latest draft v2 <time>10:52</time></span>
              </div>
              <div className="feature-copy">
                <h3>A full trace for every review</h3>
                <p>See the customer, the agent, every draft, and your feedback in one timeline.</p>
              </div>
            </article>
            <article className="feature-item feature-sentiment">
              <div className="feature-visual sentiment-visual" aria-hidden="true">
                <span>Positive <i className="sentiment-dot sentiment-positive" /></span>
                <span>Mixed <i className="sentiment-dot sentiment-mixed" /></span>
                <span>Negative <i className="sentiment-dot sentiment-negative" /></span>
                <small>Review context for the agent</small>
              </div>
              <div className="feature-copy">
                <h3>Sentiment-informed drafts</h3>
                <p>Pulse considers the review&apos;s sentiment when preparing a reply.</p>
              </div>
            </article>
            <article className="feature-item feature-refine">
              <div className="feature-visual refine-visual" aria-hidden="true">
                <p>Keep it shorter and sign off as the owner.</p>
                <span><Check /> Instruction ready for the agent</span>
              </div>
              <div className="feature-copy">
                <h3>Refine in plain words</h3>
                <p>Tell the agent what to change and review the new draft before deciding.</p>
              </div>
            </article>
            <article className="feature-item feature-decision">
              <div className="feature-visual decision-visual" aria-hidden="true">
                <CubeMark variant="check" motion="none" />
                <span><Check /> Approved in demo</span>
              </div>
              <div className="feature-copy">
                <h3>Your decision, recorded</h3>
                <p>Approve or reject a draft and keep the decision in the review&apos;s trace.</p>
              </div>
            </article>
            <article className="feature-item feature-inbox">
              <div className="feature-visual inbox-visual" aria-hidden="true">
                <div className="inbox-visual-tabs"><b>All</b><span>Pending</span><span>Approved</span><span>Rejected</span></div>
                <span><i className="inbox-dot inbox-dot-pending" /><b>Marcus Webb</b><small>2 stars</small></span>
                <span><i className="inbox-dot inbox-dot-approved" /><b>Sofia Rossi</b><small>5 stars</small></span>
              </div>
              <div className="feature-copy">
                <h3>One inbox, every status</h3>
                <p>Filter pending, approved, and rejected reviews without losing the history.</p>
              </div>
            </article>
          </div>
        </section>

        <section id="control" className="content-section page-width">
          <div className="control-card">
            <div className="control-copy">
              <h2 className="display-heading">Pulse writes. You decide.</h2>
              <p>
                Nothing reaches a customer on its own. Every reply waits for a
                person, and every demo decision stays with its review.
              </p>
              <ul className="control-list">
                <li><Check aria-hidden="true" /> Drafts wait for your action</li>
                <li><Check aria-hidden="true" /> Refine as many times as you like</li>
                <li><Check aria-hidden="true" /> Decisions stay visible in the trace</li>
              </ul>
            </div>
            <div className="control-art" aria-hidden="true">
              <svg className="control-art-lines" viewBox="0 0 360 230" preserveAspectRatio="none">
                <path d="M78 56 L180 164 L282 47" />
              </svg>
              <CubeMark variant="pin" />
              <CubeMark variant="check" delay={0.9} />
              <CubeMark variant="lock" delay={1.8} />
            </div>
          </div>
        </section>

        <section className="closing page-width">
          <div className="closing-cubes" aria-hidden="true">
            <CubeMark variant="star" motion="roll" />
            <CubeMark variant="spark" motion="roll" delay={1} />
            <CubeMark variant="check" motion="roll" delay={2} />
          </div>
          <h2 className="display-heading">
            Your next review deserves a thoughtful reply.
          </h2>
          <div className="closing-actions">
            <MotionLink href="/command-center">
              Open demo <ArrowRight aria-hidden="true" />
            </MotionLink>
            <MotionLink href="#top" variant="outline">
              Back to top <ArrowUp aria-hidden="true" />
            </MotionLink>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-content">
          <Brand />
          <p>© 2026 Review Pulse. Not affiliated with Google.</p>
        </div>
      </footer>
    </div>
  );
}
