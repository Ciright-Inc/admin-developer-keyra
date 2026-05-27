"use client";

import { useLayoutEffect, useState } from "react";

type SessionSplashProps = {
  message?: string;
  eyebrow?: string;
  /** Headline with welcome-style stagger animation (e.g. "Welcome"). */
  welcomeLine?: string | null;
  /** Fixed full-viewport overlay (logout portal, etc.). */
  fixed?: boolean;
};

const SQ_MARK_LIGHT = "/assets/keyra_logo_sq_black.png";
const SQ_MARK_DARK = "/assets/keyra_logo_sq_white.png";

/** Time for logo/headline intro before message-only updates. */
const INTRO_MS = 950;

export function SessionSplash({
  message = "Loading session…",
  eyebrow = "Global Administration Console",
  welcomeLine = "Welcome",
  fixed = false,
}: SessionSplashProps) {
  const [introDone, setIntroDone] = useState(false);

  useLayoutEffect(() => {
    const t = window.setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  const rootClass = [
    fixed ? "ds-session-splash ds-auth-flow-splash--fixed" : "ds-session-splash",
    introDone ? "ds-session-splash--intro-done" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={message}>
      <div className="ds-session-splash__panel">
        <div className="ds-session-splash__logo-wrap" aria-hidden>
          <img
            src={SQ_MARK_LIGHT}
            alt=""
            width={64}
            height={64}
            className="ds-session-splash__logo ds-session-splash__logo--light"
            decoding="async"
          />
          <img
            src={SQ_MARK_DARK}
            alt=""
            width={64}
            height={64}
            className="ds-session-splash__logo ds-session-splash__logo--dark"
            decoding="async"
          />
        </div>

        <div className="ds-session-splash__brand">
          <p className="ds-session-splash__eyebrow">{eyebrow}</p>
          {welcomeLine ? <p className="ds-session-splash__welcome">{welcomeLine}</p> : null}
          <div className="ds-session-splash__progress" aria-hidden>
            <span className="ds-session-splash__progress-fill" />
          </div>
          <p key={introDone ? message : "splash-message"} className="ds-session-splash__message">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
