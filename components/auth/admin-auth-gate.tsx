"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";
import { consumeAuthReturnUrlParam, hasPendingAuthReturn, clearPendingAuthReturn } from "@/lib/get-started-sign-in-url";
import { MIN_SESSION_SPLASH_MS } from "@/lib/session-splash";
import { SessionSplash } from "@/components/layout/session-splash";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAdminAuthStore((s) => s.status);
  const hydrated = useAdminAuthStore((s) => s.hydrated);
  const user = useAdminAuthStore((s) => s.user);
  const error = useAdminAuthStore((s) => s.error);
  const init = useAdminAuthStore((s) => s.init);
  const refresh = useAdminAuthStore((s) => s.refresh);
  const signOut = useAdminAuthStore((s) => s.signOut);

  const [authReturnFlow, setAuthReturnFlow] = useState(false);
  const [bootMinElapsed, setBootMinElapsed] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const t = setTimeout(() => setBootMinElapsed(true), MIN_SESSION_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hasPendingAuthReturn()) {
      setAuthReturnFlow(true);
      consumeAuthReturnUrlParam();
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && authReturnFlow) {
      clearPendingAuthReturn();
      setAuthReturnFlow(false);
    }
    if (hydrated && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [hydrated, status, router, authReturnFlow]);

  const waitingSession = !hydrated || status === "idle" || status === "loading";
  const redirectingToLogin = hydrated && status === "unauthenticated";
  const showSplash = waitingSession || redirectingToLogin || !bootMinElapsed;

  if (showSplash) {
    const message = redirectingToLogin
      ? "Redirecting to sign-in…"
      : authReturnFlow
        ? "Signing you in…"
        : waitingSession
          ? "Verifying session…"
          : "Loading session…";

    return (
      <SessionSplash
        message={message}
        eyebrow="Global Administration Console"
        welcomeLine={authReturnFlow ? "Welcome" : null}
      />
    );
  }

  if (status === "forbidden") {
    return (
      <BlockedScreen
        icon="block"
        eyebrow="Access denied"
        title="Super-admin role required"
        body={
          <>
            You&apos;re signed in as{" "}
            <span className="text-[var(--ds-ink)] font-mono">{user?.phone ?? user?.email ?? "this account"}</span>,
            but the KEYRA Global Administration Console is reserved for accounts with the{" "}
            <code className="text-[var(--ds-ink)] font-mono">super_admin</code> role.
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => void refresh()}>
              <MaterialIcon name="refresh" size={14} /> Re-check role
            </Button>
            <Button variant="danger" onClick={() => void signOut().then(() => router.replace("/login"))}>
              <MaterialIcon name="logout" size={14} /> Sign out
            </Button>
          </>
        }
      />
    );
  }

  if (status === "unreachable") {
    return (
      <BlockedScreen
        icon="cloud_off"
        eyebrow="Backend unreachable"
        title="Admin API is not responding"
        body={
          <>
            We couldn&apos;t reach{" "}
            <code className="text-[var(--ds-ink)] font-mono">/admin/global/me</code> on the auth backend.
            {error ? <> Last error: <span className="font-mono text-[var(--ds-error)]">{error}</span>.</> : null}
            <br />
            Start <code className="font-mono text-[var(--ds-ink)]">simsecure-auth-session</code> on port 4000 and retry.
          </>
        }
        actions={
          <Button variant="primary" onClick={() => void refresh()}>
            <MaterialIcon name="refresh" size={14} /> Retry
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}

function BlockedScreen({
  icon,
  eyebrow,
  title,
  body,
  actions,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[var(--ds-canvas-soft)]">
      <div className="ds-feature-card ds-fade-up max-w-lg w-full">
        <div className="p-8 space-y-4">
          <div className="ds-caption-uppercase text-[var(--ds-error)]">{eyebrow}</div>
          <div className="flex items-center gap-3">
            <MaterialIcon name={icon} size={24} className="text-[var(--ds-error)]" />
            <h1 className="text-[22px] font-semibold tracking-tight text-[var(--ds-ink)]">{title}</h1>
          </div>
          <p className="text-[14px] text-[var(--ds-body)] leading-relaxed">{body}</p>
          <div className="pt-2 flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      </div>
    </div>
  );
}
