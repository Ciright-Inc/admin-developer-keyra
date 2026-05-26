/**
 * Normalise an origin-like env var value to an absolute URL.
 *
 * Accepts:
 *   "auth.keyra.ie"                 -> "https://auth.keyra.ie"
 *   "localhost:4000"                -> "http://localhost:4000"
 *   "https://auth.keyra.ie/"        -> "https://auth.keyra.ie"
 *   "" / undefined / null / "   "   -> ""
 *
 * Used for every NEXT_PUBLIC_*_URL so Railway-style env vars that omit the
 * scheme don't blow up `new URL(...)` callers at runtime.
 */
export function normalizeOrigin(value: string | undefined | null): string {
  const trimmed = String(value ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const hostOnly = trimmed.split("/")[0] ?? "";
  if (/^localhost(:\d+)?$/i.test(hostOnly) || /^127\.0\.0\.1(:\d+)?$/i.test(hostOnly)) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

/** Back-compat alias — earlier callers imported this name. */
export const normalizeBackendBaseUrl = normalizeOrigin;

const raw = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL ?? "http://localhost:4000";

export const AUTH_BACKEND_URL = normalizeOrigin(raw) || "http://localhost:4000";

/** Base URL of all /admin/global/* endpoints. */
export const ADMIN_API_BASE = `${AUTH_BACKEND_URL}/admin/global`;

/** Build an absolute URL to an /admin/global/* endpoint with query params. */
export function adminUrl(path: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${ADMIN_API_BASE}${trimmed}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
