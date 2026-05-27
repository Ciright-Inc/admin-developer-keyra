"use client";

import { AUTH_BACKEND_URL, ADMIN_API_BASE } from "@/lib/admin-backend-url";

export type AuthSessionUser = {
  id: number;
  phone: string;
  fullName: string | null;
  email: string | null;
  profileComplete?: boolean;
  username?: string;
  displayName?: string;
};

export type AdminMe = AuthSessionUser & {
  role: string;
  capabilities: string[];
};

/** Result of an admin handshake. `forbidden` = logged in but not super_admin. */
export type AdminMeResult =
  | { status: "ok"; admin: AdminMe }
  | { status: "unauthenticated" }
  | { status: "forbidden"; user?: AuthSessionUser | null }
  | { status: "unreachable"; error: string };

const AUTH_FETCH_TIMEOUT_MS = 12_000;

function authFetchTimeoutSignal(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Auth backend request timed out", "TimeoutError")),
    AUTH_FETCH_TIMEOUT_MS,
  );
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

function formatAuthFetchError(err: unknown): string {
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return `Request timed out after ${AUTH_FETCH_TIMEOUT_MS / 1000}s — is simsecure-auth-session running on port 4000?`;
  }
  if (err instanceof Error && err.name === "AbortError") {
    return err.message || "Request was aborted";
  }
  return err instanceof Error ? err.message : "network_error";
}

/** GET /auth/session — light session probe (no role). */
export async function getSession(): Promise<AuthSessionUser | null> {
  const { signal, clear } = authFetchTimeoutSignal();
  try {
    const res = await fetch(`${AUTH_BACKEND_URL}/auth/session`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { authenticated?: boolean; user?: AuthSessionUser | null };
    return json.authenticated && json.user ? json.user : null;
  } catch {
    return null;
  } finally {
    clear();
  }
}

/**
 * GET /admin/global/me — the source of truth for super-admin status.
 * Returns a tagged result so the UI can render the right state per HTTP code.
 */
export async function getAdminMe(): Promise<AdminMeResult> {
  const { signal, clear } = authFetchTimeoutSignal();
  try {
    const res = await fetch(`${ADMIN_API_BASE}/me`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (res.status === 401) return { status: "unauthenticated" };
    if (res.status === 403) {
      const fallback = await getSession().catch(() => null);
      return { status: "forbidden", user: fallback };
    }
    if (!res.ok) {
      return { status: "unreachable", error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as { data?: AdminMe };
    if (!json?.data) return { status: "unreachable", error: "malformed_response" };
    return { status: "ok", admin: json.data };
  } catch (err) {
    return { status: "unreachable", error: formatAuthFetchError(err) };
  } finally {
    clear();
  }
}

/** POST /auth/logout — destroys the cookie-backed session. */
export async function logout(): Promise<void> {
  const { signal, clear } = authFetchTimeoutSignal();
  try {
    await fetch(`${AUTH_BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      signal,
    });
  } catch {
    /* swallow — logout is best-effort, the cookie can be force-expired client-side */
  } finally {
    clear();
  }
}
