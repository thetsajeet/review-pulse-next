const reviews = [
  { initials: "MW", name: "Marcus Webb", time: "18m ago", stars: 2, snippet: "Waited 40 minutes for a cold pizza..." },
  { initials: "PN", name: "Priya Nair", time: "2m ago", stars: 5, snippet: "Loved the filter coffee and the quiet corner..." },
  { initials: "AK", name: "Aisha Khan", time: "1h ago", stars: 4, snippet: "Great ambience, slightly pricey..." },
  { initials: "TB", name: "Tom Becker", time: "3h ago", stars: 1, snippet: "Found a hair in my soup..." },
];

export function ProductPreview() {
  return (
    <figure className="product-preview" aria-labelledby="preview-caption">
      <div className="preview-toolbar" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="preview-body">
        <div className="preview-inbox">
          <div className="preview-tabs">
            <span className="preview-status preview-status-pending">
              <Clock3 aria-hidden="true" /> Pending <strong>4</strong>
            </span>
            <span className="preview-status preview-status-approved">
              <CircleCheck aria-hidden="true" /> Approved <strong>1</strong>
            </span>
            <span className="preview-status preview-status-rejected">
              <CircleX aria-hidden="true" /> Rejected <strong>1</strong>
            </span>
          </div>
          {reviews.map((review, index) => (
            <div className={`preview-review ${index === 0 ? "preview-review-active" : ""}`} key={review.name}>
              <span className="preview-avatar">{review.initials}</span>
              <div className="preview-review-content">
                <div className="preview-review-header">
                  <strong>{review.name}</strong><span>{review.time}</span>
                </div>
                <span className="preview-stars" aria-label={`${review.stars} out of 5 stars`}>
                  {"★".repeat(review.stars)}<span>{"★".repeat(5 - review.stars)}</span>
                </span>
                <p>{review.snippet}</p>
              </div>
            </div>
          ))}
        </div>
        <ol className="preview-trace" aria-label="Sample review timeline">
          <li className="preview-node">
            <span className="preview-node-marker"><MessageSquare aria-hidden="true" /></span>
            <span className="preview-node-label">CUSTOMER REVIEW</span>
            <p>Waited 40 minutes for a cold pizza and nobody apologised at the table or at the counter.</p>
          </li>
          <li className="preview-node">
            <span className="preview-node-marker"><Sparkles aria-hidden="true" /></span>
            <span className="preview-node-label">AGENT DRAFT V1</span>
            <p>Hi Marcus, thank you for your feedback. We are sorry we fell short and would love the chance to make it right.</p>
          </li>
          <li className="preview-node">
            <span className="preview-node-marker"><MessageSquareText aria-hidden="true" /></span>
            <span className="preview-node-label">HUMAN FEEDBACK</span>
            <p>Warmer tone, name the manager, invite them back.</p>
          </li>
          <li className="preview-node preview-node-latest">
            <span className="preview-node-marker"><Sparkles aria-hidden="true" /></span>
            <span className="preview-node-label">LATEST AGENT DRAFT V2</span>
            <p>Hi Marcus, thank you for sharing this. We are truly sorry, and our manager Rhea would like to make it right.</p>
            <div className="preview-actions" aria-hidden="true">
              <span><Check /> Approve</span>
              <span><X /> Reject</span>
              <span><RefreshCw /> Refactor</span>
            </div>
          </li>
        </ol>
      </div>
      <figcaption id="preview-caption">Illustrative preview with sample reviews. Actions are not connected.</figcaption>
    </figure>
  );
}
import {
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  MessageSquare,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

