"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LockKeyhole } from "lucide-react";
import { Cube } from "@/components/illustrations/cube";
import { BrandMark } from "@/components/illustrations/brand-mark";
import { MotionScope } from "@/components/illustrations/motion-scope";
import "./auth-screen.css";

type AuthScreenKind = "login" | "signup" | "signed-out";

const copy = {
  login: {
    title: "Welcome back",
    description: "Log in with the Google account you use for your business.",
    button: "Continue with Google",
  },
  signup: {
    title: "Start answering reviews",
    description: "Create your account with Google. No password to remember.",
    button: "Continue with Google",
  },
  "signed-out": {
    title: "You are signed out",
    description: "Your reviews are safe and nothing was sent while you were away.",
    button: "Sign back in with Google",
  },
} as const;

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width="24" height="24">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.7-4 6.1v5.1h6.5c3.8-3.5 6.1-8.6 6.1-14.9Z" />
      <path fill="#34A853" d="M24 44c5.4 0 10-1.8 13.4-4.9L31 34c-1.8 1.2-4.1 1.9-7 1.9-5.2 0-9.6-3.5-11.2-8.2H6.1V33A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.8 27.7a12 12 0 0 1 0-7.4V15H6.1a20 20 0 0 0 0 18l6.7-5.3Z" />
      <path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 6.1 15l6.7 5.3c1.6-4.7 6-8.2 11.2-8.2Z" />
    </svg>
  );
}

function AuthArtwork() {
  return (
    <aside className="auth-art" aria-label="Illustration of a review and a draft reply">
      <div className="auth-review-card">
        <div className="auth-review-heading"><span className="auth-avatar">MW</span><div><strong>Marcus Webb</strong><div className="auth-stars"><span>★★</span>★★★</div></div></div>
        <p>Waited 40 minutes for a cold pizza and nobody apologised.</p>
      </div>
      <MotionScope className="auth-cubes">
        <div className="cube-motion-hop"><Cube variant="star" /></div>
        <div className="cube-motion-hop"><Cube variant="check" /></div>
        <div className="cube-motion-hop"><Cube variant="spark" /></div>
      </MotionScope>
      <div className="auth-draft-card">
        <strong>Cubecca draft</strong>
        <p>Hi Marcus, we are truly sorry. Please come back for a dessert on us.</p>
        <div aria-hidden="true"><span>Approve</span><span>Refactor</span></div>
      </div>
      <p className="auth-art-caption">Every review answered.<br /><em>Nothing</em> sent unseen.</p>
    </aside>
  );
}

export function AuthScreen({ kind }: { kind: AuthScreenKind }) {
  const [notice, setNotice] = useState(false);
  const content = copy[kind];
  return (
    <main className="auth-page">
      <div className="auth-main">
        <Link className="auth-brand" href="/"><BrandMark /><span>Cubecca</span></Link>
        <section className="auth-content" aria-labelledby="auth-title">
          {kind === "signed-out" && <div className="auth-success"><Check aria-hidden="true" /> Signed out screen preview</div>}
          <h1 id="auth-title">{content.title}</h1>
          <p className="auth-description">{content.description}</p>
          <button className="auth-google" type="button" onClick={() => setNotice(true)}><GoogleMark />{content.button}</button>
          {notice && <p className="auth-notice" role="status">Google sign-in is not available yet. <Link href="/workspace/dashboard">Explore the dashboard</Link>.</p>}
          {kind === "signup" ? (
            <>
              <ul className="auth-benefits">
                <li><Check aria-hidden="true" />Connect your Google Business Profile</li>
                <li><Check aria-hidden="true" />See your first draft in minutes</li>
                <li><Check aria-hidden="true" />Approve it. Nothing is sent until you do</li>
              </ul>
              <p className="auth-note"><LockKeyhole aria-hidden="true" /> Google sign-in and account creation are not available yet.</p>
              <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
            </>
          ) : (
            <>
              <p className="auth-note"><LockKeyhole aria-hidden="true" />{kind === "login" ? "Nothing is sent without your approval. Google account access is not available yet." : "This is a preview; no account session was changed."}</p>
              <p className="auth-switch">{kind === "login" ? <>New to Cubecca? <Link href="/signup">Sign up</Link></> : <>Not you? <Link href="/login">Use a different account</Link></>}</p>
            </>
          )}
        </section>
        <p className="auth-copyright">© 2026 Cubecca</p>
      </div>
      <AuthArtwork />
    </main>
  );
}
