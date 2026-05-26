"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";
import { consumeAuthReturnUrlParam, hasPendingAuthReturn, clearPendingAuthReturn } from "@/lib/get-started-sign-in-url";
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

  useEffect(() => {
    void init();
  }, [init]);

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

  if (!hydrated || status === "idle" || status === "loading") {
    return <Splash label={authReturnFlow ? "Signing you in…" : "Verifying session…"} />;
  }

  if (status === "unauthenticated") {
    return <Splash label="Redirecting to sign-in…" />;
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

function Splash({ label }: { label: string }) {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[var(--ds-canvas-soft)]">
      <div className="flex flex-col items-center gap-4 ds-fade-up">
        <img
          src="/assets/keyra_logo_sq_black.png"
          alt=""
          className="h-10 w-auto ds-topnav__crumb-logo--light"
        />
        <img
          src="/assets/keyra_logo_sq_white.png"
          alt=""
          className="h-10 w-auto ds-topnav__crumb-logo--dark"
        />
        <div className="flex items-center gap-2.5 text-[12.5px] tracking-wider uppercase text-[var(--ds-muted)] font-medium">
          <span className="animate-loader-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-[var(--ds-hairline-strong)] border-t-[var(--ds-ink)]" />
          {label}
        </div>
      </div>
    </div>
  );
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
