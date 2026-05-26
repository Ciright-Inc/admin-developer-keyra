"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";
import {
  buildGetStartedSignInUrl,
  getGetStartedPublicOrigin,
  markPendingAuthReturn,
} from "@/lib/get-started-sign-in-url";

function LoginFallback() {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[var(--ds-canvas-soft)]">
      <div className="w-full max-w-md ds-feature-card">
        <div className="p-8">
          <div className="ds-skeleton h-7 w-32 mb-6" />
          <div className="ds-skeleton h-6 w-48 mb-3" />
          <div className="ds-skeleton h-4 w-full mb-2" />
          <div className="ds-skeleton h-4 w-3/4 mb-6" />
          <div className="ds-skeleton h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </React.Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = useAdminAuthStore((s) => s.status);
  const hydrated = useAdminAuthStore((s) => s.hydrated);
  const init = useAdminAuthStore((s) => s.init);
  const signOut = useAdminAuthStore((s) => s.signOut);

  React.useEffect(() => {
    void init();
  }, [init]);

  const returnPath = (() => {
    const raw = params.get("return") || params.get("return_to") || "/dashboard";
    if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
    return raw;
  })();

  React.useEffect(() => {
    if (hydrated && status === "authenticated") {
      router.replace(returnPath);
    }
  }, [hydrated, status, returnPath, router]);

  const ssoUrl = React.useMemo(() => buildGetStartedSignInUrl(returnPath), [returnPath]);
  const ssoHost = React.useMemo(() => getGetStartedPublicOrigin().replace(/^https?:\/\//, ""), []);

  const handleSignIn = () => {
    markPendingAuthReturn();
    window.location.href = ssoUrl;
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[var(--ds-canvas-soft)]">
      <div className="w-full max-w-md ds-feature-card ds-fade-up">
        <div className="p-8">
          <div className="mb-6">
            <img
              src="/assets/keyra_logo_hz_black.png"
              alt="KEYRA"
              className="h-7 w-auto ds-topnav__crumb-logo--light"
            />
            <img
              src="/assets/keyra_logo_hz_white.png"
              alt="KEYRA"
              className="h-7 w-auto ds-topnav__crumb-logo--dark"
            />
            <div className="mt-3 ds-caption-uppercase">admin.developer.keyra.ie</div>
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--ds-ink)] mb-2">
            Restricted access
          </h1>
          <p className="text-[14px] text-[var(--ds-body)] mb-6 leading-relaxed">
            Verify your identity on{" "}
            <span className="text-[var(--ds-text-link)] font-mono">{ssoHost}</span> with your KEYRA phone number.
            After verification you&apos;ll be returned here automatically — only accounts with the{" "}
            <span className="font-mono text-[var(--ds-ink)]">super_admin</span> role can proceed past the gate.
          </p>

          {status === "forbidden" ? (
            <div className="ds-inset mb-4">
              <div className="text-[13px] text-[var(--ds-body)] flex items-start gap-2">
                <MaterialIcon name="block" size={16} className="text-[var(--ds-error)] mt-0.5" />
                <span>
                  You&apos;re signed in but not a super-admin. Sign out and use a super-admin account, or ask an
                  existing super-admin to promote your phone.
                </span>
              </div>
            </div>
          ) : null}

          {status === "unreachable" ? (
            <div className="ds-inset mb-4">
              <div className="text-[13px] text-[var(--ds-body)] flex items-start gap-2">
                <MaterialIcon name="cloud_off" size={16} className="text-[var(--ds-warning)] mt-0.5" />
                <span>
                  The admin backend is not reachable. Start{" "}
                  <code className="font-mono text-[var(--ds-ink)]">simsecure-auth-session</code> on port 4000 and reload.
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={handleSignIn}>
              <MaterialIcon name="login" size={16} />
              Continue with KEYRA SSO
            </Button>
            {status === "forbidden" ? (
              <Button variant="outline" onClick={() => void signOut()}>
                <MaterialIcon name="logout" size={16} />
                Sign out of current account
              </Button>
            ) : (
              <Link href="/" className="ds-btn ds-btn--outline">
                <MaterialIcon name="arrow_back" size={16} />
                Back to home
              </Link>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--ds-hairline-strong)] flex items-center gap-2 flex-wrap">
            <Badge tone="muted">SOC 2 Type II</Badge>
            <Badge tone="muted">FIDO2 enforced</Badge>
            <Badge tone="muted">mTLS</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
