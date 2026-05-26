"use client";

import { AUTH_BACKEND_URL, normalizeOrigin } from "@/lib/admin-backend-url";

const LOCAL_GET_STARTED = "http://localhost:5173";
const PRODUCTION_GET_STARTED = "https://get-started.keyra.ie";

const LOCAL_ADMIN_CONSOLE = "http://localhost:3100";
const PRODUCTION_ADMIN_CONSOLE = "https://admin.developer.keyra.ie";

const AUTH_RETURN_PARAM = "auth_return";
const AUTH_RETURN_STORAGE_KEY = "keyra_admin_pending_auth_return";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalAuthBackend(): boolean {
  const trimmed = String(AUTH_BACKEND_URL ?? "").trim();
  if (!trimmed) return true;
  try {
    const { hostname } = new URL(trimmed);
    return isLocalHostname(hostname);
  } catch {
    return false;
  }
}

/** Resolve the get-started origin for the current environment. */
export function getGetStartedPublicOrigin(): string {
  const explicit = normalizeOrigin(process.env.NEXT_PUBLIC_GET_STARTED_URL);
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return LOCAL_GET_STARTED;
  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) return LOCAL_GET_STARTED;
  if (isLocalAuthBackend()) return LOCAL_GET_STARTED;
  return PRODUCTION_GET_STARTED;
}

/** Resolve the admin console origin (consistent on server + client for hydration). */
export function getAdminConsoleOrigin(): string {
  const explicit = normalizeOrigin(process.env.NEXT_PUBLIC_GLOBAL_ADMIN_URL);
  if (explicit) return explicit;
  if (process.env.NODE_ENV === "development") return LOCAL_ADMIN_CONSOLE;
  if (typeof window !== "undefined") return window.location.origin;
  return PRODUCTION_ADMIN_CONSOLE;
}

/**
 * Build an absolute return URL into the admin console (default `/dashboard`).
 *
 * Wrapped in try/catch so a misconfigured `NEXT_PUBLIC_GLOBAL_ADMIN_URL`
 * (e.g. missing scheme) degrades to safe string concatenation rather than
 * throwing `Invalid base URL` and tearing down the login page on Railway.
 */
export function buildAdminReturnUrl(returnPath = "/dashboard"): string {
  const origin = getAdminConsoleOrigin();
  const path = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  try {
    const url = new URL(path, origin);
    url.searchParams.set(AUTH_RETURN_PARAM, "1");
    return url.toString();
  } catch {
    const separator = path.includes("?") ? "&" : "?";
    return `${origin}${path}${separator}${AUTH_RETURN_PARAM}=1`;
  }
}

/** Build the get-started sign-in URL with ?return= pointing back to the admin console. */
export function buildGetStartedSignInUrl(returnPath = "/dashboard"): string {
  const returnTo = buildAdminReturnUrl(returnPath);
  return `${getGetStartedPublicOrigin()}/?return=${encodeURIComponent(returnTo)}`;
}

/** Latch a session-storage marker so the splash can show "Signing you in…" after redirect. */
export function markPendingAuthReturn() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(AUTH_RETURN_STORAGE_KEY, "1");
}

export function consumeAuthReturnUrlParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(AUTH_RETURN_PARAM)) return;
  url.searchParams.delete(AUTH_RETURN_PARAM);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

export function hasPendingAuthReturn(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get(AUTH_RETURN_PARAM) === "1") return true;
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(AUTH_RETURN_STORAGE_KEY) === "1";
}

export function clearPendingAuthReturn() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(AUTH_RETURN_STORAGE_KEY);
}
