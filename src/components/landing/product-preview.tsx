import { Check, MessageSquare, RefreshCw, Sparkles, Star, X } from "lucide-react";

const reviews = [
  { initials: "PN", name: "Priya Nair", time: "2m ago", stars: 5, snippet: "Loved the filter coffee and the quiet corner..." },
  { initials: "MW", name: "Marcus Webb", time: "18m ago", stars: 2, snippet: "Waited 40 minutes for a cold pizza..." },
  { initials: "AK", name: "Aisha Khan", time: "1h ago", stars: 4, snippet: "Great ambience, slightly pricey..." },
];

export function ProductPreview() {
  return (
    <figure className="product-preview" aria-labelledby="preview-caption">
      <div className="preview-window-bar" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="preview-toolbar">
        <span className="preview-toolbar-title">Brewhouse Koregaon Park <span>/</span> Review inbox</span>
        <span className="preview-toolbar-context"><i /> Demo workspace</span>
      </div>
      <div className="preview-body">
        <div className="preview-inbox">
          <div className="preview-tabs">
            <span className="preview-tab preview-tab-active">All <b>6</b></span>
            <span className="preview-tab">Pending <b>4</b></span>
            <span className="preview-tab">Approved <b>1</b></span>
          </div>
          {reviews.map((review) => (
            <div className={`preview-review ${review.name === "Marcus Webb" ? "preview-review-active" : ""}`} key={review.name}>
              <span className="preview-avatar">{review.initials}</span>
              <div className="preview-review-content">
                <div className="preview-review-header">
                  <strong>{review.name}</strong><span>{review.time}</span>
                </div>
                <span className="preview-stars" aria-label={`${review.stars} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star
                      key={starIndex}
                      aria-hidden="true"
                      className={starIndex < review.stars ? "star-filled" : ""}
                    />
                  ))}
                </span>
                <p>{review.snippet}</p>
                <span className="preview-review-status preview-review-status-pending">
                  Pending
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="preview-trace">
          <article className="preview-node">
            <div className="preview-node-heading">
              <span className="preview-node-label"><MessageSquare aria-hidden="true" /> Customer review</span>
              <time>10:42</time>
            </div>
            <p>Waited 40 minutes for a cold pizza and nobody apologised at the table or at the counter.</p>
          </article>
          <article className="preview-node preview-node-latest">
            <div className="preview-node-heading">
              <span className="preview-node-label"><Sparkles aria-hidden="true" /> Latest agent draft v2</span>
              <time>10:52</time>
            </div>
            <p>Hi Marcus, thank you for sharing this. We are truly sorry, and our manager Rhea would like to make it right. Please come back for a dessert on us.</p>
            <div className="preview-actions" aria-hidden="true">
              <span><Check /> Approve</span>
              <span><X /> Reject</span>
              <span><RefreshCw /> Refine</span>
            </div>
          </article>
          <p className="preview-demo-note">Sample draft · not sent to Google</p>
        </div>
      </div>
      <figcaption id="preview-caption">Illustrative workspace. Sample reviews and actions only.</figcaption>
    </figure>
  );
}
