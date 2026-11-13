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
            <span className="preview-tab-active">Pending 4</span>
            <span>Approved 1</span>
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
        <div className="preview-trace">
          <div className="preview-node">
            <span>CUSTOMER REVIEW</span>
            <p>Waited 40 minutes for a cold pizza and nobody apologised at the table or at the counter.</p>
          </div>
          <div className="preview-node">
            <span>HUMAN FEEDBACK</span>
            <p>Warmer tone, name the manager, invite them back.</p>
          </div>
          <div className="preview-node">
            <span>LATEST AGENT DRAFT V2</span>
            <p>Hi Marcus, thank you for sharing this. We are truly sorry, and our manager Rhea would like to make it right.</p>
            <div className="preview-actions" aria-hidden="true">
              <span>Approve</span><span>Reject</span><span>Refactor</span>
            </div>
          </div>
        </div>
      </div>
      <figcaption id="preview-caption">Illustrative preview with sample reviews. Actions are not connected.</figcaption>
    </figure>
  );
}
