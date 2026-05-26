/**
 * Resolves the simsecure-auth-session backend URL where all /admin/global/* endpoints live.
 * Values like "auth.keyra.ie" without a scheme are normalised to absolute URLs.
 */
export function normalizeBackendBaseUrl(value: string): string {
  const trimmed = String(value ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const hostOnly = trimmed.split("/")[0] ?? "";
  if (/^localhost(:\d+)?$/i.test(hostOnly) || /^127\.0\.0\.1(:\d+)?$/i.test(hostOnly)) {
    return `http://${trimmed}`;
  }
  return `https://${trimmed}`;
}

const raw = process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL ?? "http://localhost:4000";

export const AUTH_BACKEND_URL = normalizeBackendBaseUrl(raw) || "http://localhost:4000";

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
