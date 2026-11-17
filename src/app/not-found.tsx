import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/illustrations/brand-mark";
import { MotionScope } from "@/components/illustrations/motion-scope";
import "./not-found.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link href="/" className="not-found-brand">
          <BrandMark />
          <span>Cubecca</span>
        </Link>
      </header>

      <div className="not-found-content">
        <MotionScope className="not-found-illustration">
          <span aria-hidden="true">4</span>
          <div className="not-found-cube">
            <span className="not-found-oops" aria-hidden="true">Oops!</span>
            <svg viewBox="0 0 260 300" aria-hidden="true">
              <ellipse className="not-found-shadow" cx="130" cy="250" rx="100" ry="26" fill="#e4e4e7" />
              <g className="not-found-faces">
                <g stroke="#18181b" strokeWidth="1.5" strokeLinejoin="round">
                  <polygon points="50.3,74 130,120 130,212 50.3,166" fill="#34d399" />
                  <polygon points="209.7,74 130,120 130,212 209.7,166" fill="#10b981" />
                  <polygon points="130,28 209.7,74 130,120 50.3,74" fill="#6ee7b7" />
                </g>
                <g transform="translate(130 28) matrix(.866 .5 -.866 .5 0 0) scale(92)">
                  <polygon points=".18,.18 .5,.32 .82,.18 .68,.5 .82,.82 .5,.68 .18,.82 .32,.5" fill="#fff" />
                </g>
              </g>
            </svg>
          </div>
          <span aria-hidden="true">4</span>
        </MotionScope>
        <span className="not-found-sr-only">404</span>
        <h1>This page took a wrong turn.</h1>
        <p>The link may be broken or the page may have moved.<br className="not-found-break" /> Even Cubecca could not find it.</p>
        <div className="not-found-actions">
          <Link href="/workspace/reviews">Back to reviews</Link>
          <Link href="/workspace/dashboard">Go to dashboard</Link>
        </div>
      </div>

      <MotionScope className="not-found-floor">
        <Image src="/assets/cubes/cube-star-amber.svg" alt="" width={130} height={150} />
        <Image src="/assets/cubes/cube-pin-white.svg" alt="" width={130} height={150} />
      </MotionScope>
    </main>
  );
}
