import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

const bars = [
  [8, 3, 1], [6, 2, 0], [9, 3, 2], [7, 2, 1], [10, 4, 1],
  [5, 2, 0], [8, 3, 1], [11, 3, 2], [9, 2, 1], [7, 3, 0],
  [12, 4, 1], [10, 3, 2], [8, 2, 1], [13, 4, 1],
];

const attention = [
  { name: "Marcus Webb", rating: 2, sentiment: "Negative", text: "Waited 40 minutes for a cold pizza" },
  { name: "Tom Becker", rating: 1, sentiment: "Negative", text: "Found a hair in my soup and the manager" },
  { name: "Aisha Khan", rating: 4, sentiment: "Mixed", text: "Great ambience, slightly pricey" },
];

function Sparkline({ points }: { points: string }) {
  return <svg className="dash-sparkline" viewBox="0 0 250 32" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.7" vectorEffect="non-scaling-stroke" /></svg>;
}

export default function DashboardPage() {
  return (
      <main className="dash-main">
        <section className="dash-frame" aria-labelledby="dashboard-title">
          <header className="dash-frame-header">
            <div><h1 id="dashboard-title">Dashboard</h1><p>Illustrative dashboard data</p></div>
            <div className="dash-controls"><span className="dash-period" aria-label="Example period: 30 days"><span>7d</span><strong>30d</strong><span>90d</span></span><span className="dash-location">All locations</span></div>
          </header>
          <div className="dash-content">
            <div className="dash-stats">
              <article className="dash-stat"><div className="dash-stat-heading"><h2>Average rating</h2><span>↗ 0.2</span></div><p className="dash-stat-number">4.3 <small>/ 5</small></p><p className="dash-muted">vs previous 30 days</p><Sparkline points="0,27 42,20 83,15 125,20 167,9 208,15 250,4" /></article>
              <article className="dash-stat"><div className="dash-stat-heading"><h2>New reviews</h2><span>↗ 14%</span></div><p className="dash-stat-number">128</p><p className="dash-muted">last 30 days</p><Sparkline points="0,24 42,13 83,27 125,17 167,7 208,21 250,4" /></article>
              <article className="dash-stat"><div className="dash-stat-heading"><h2>Response rate</h2><span>↗ 6 pts</span></div><p className="dash-stat-number">92 <small>%</small></p><p className="dash-muted">replied to or closed</p><Sparkline points="0,27 42,23 83,16 125,13 167,10 208,5 250,3" /></article>
              <article className="dash-stat dash-stat-pending"><div className="dash-stat-heading"><h2>Pending replies</h2></div><p className="dash-stat-number">4</p><p className="dash-muted">Waiting for your approval</p><Link className="dash-inbox-button" href="/workspace/reviews">Open inbox <ArrowUpRight /></Link></article>
            </div>
            <div className="dash-panels">
              <section className="dash-chart-card" aria-labelledby="chart-title">
                <div className="dash-panel-header"><div><h2 id="chart-title">Reviews over time</h2><p className="dash-muted">Last 14 days, by AI sentiment</p></div><div className="dash-legend"><span><i /> Positive</span><span><i /> Mixed</span><span><i /> Negative</span></div></div>
                <div className="dash-chart" role="img" aria-label="Illustrative stacked bar chart of positive, mixed and negative reviews over 14 days">
                  {bars.map(([positive, mixed, negative], index) => <div className="dash-bar" key={index}><span className="bar-positive" style={{ height: `${positive * 11}px` }} /><span className="bar-mixed" style={{ height: `${mixed * 11}px` }} />{negative > 0 && <span className="bar-negative" style={{ height: `${negative * 11}px` }} />}</div>)}
                </div>
                <div className="dash-axis"><span>Nov 2</span><span>Nov 9</span><span>Nov 16</span></div>
              </section>
              <section className="dash-attention" aria-labelledby="attention-title">
                <div className="dash-panel-header"><h2 id="attention-title">Needs your attention</h2><span className="dash-count">4</span></div>
                {attention.map((review) => <article className="dash-review" key={review.name}><div><strong>{review.name}</strong><span className="dash-sentiment">{review.sentiment}</span></div><span className="dash-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < review.rating ? "filled" : ""} aria-hidden="true" />)}</span><p>{review.text}</p></article>)}
              </section>
            </div>
          </div>
        </section>
      </main>
  );
}
