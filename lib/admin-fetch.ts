import { adminUrl } from "./admin-backend-url";

export class AdminApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.body = body;
  }
}

type JsonInit = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: BodyInit | Record<string, unknown> | null;
};

/**
 * In RSC / route handlers, the global `fetch` does not auto-forward the
 * browser's session cookie. We read it from `next/headers` and inject it
 * as a `Cookie:` request header so the backend sees the same session that
 * authenticated the original page request. No-op on the client (browser
 * forwards cookies automatically via `credentials: "include"`).
 */
async function buildServerCookieHeader(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  try {
    const mod = await import("next/headers");
    const store = await mod.cookies();
    const all = store.getAll();
    if (!all.length) return null;
    return all.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch {
    return null;
  }
}

export async function adminFetch<T = unknown>(path: string, init: JsonInit = {}): Promise<T> {
  const { params, body: rawBody, ...rest } = init;
  let body: BodyInit | null | undefined;
  const isPlainObject =
    rawBody != null &&
    typeof rawBody === "object" &&
    !(rawBody instanceof FormData) &&
    !(rawBody instanceof Blob) &&
    !(rawBody instanceof ArrayBuffer) &&
    !(rawBody instanceof URLSearchParams);
  if (isPlainObject) {
    body = JSON.stringify(rawBody);
  } else {
    body = rawBody as BodyInit | null | undefined;
  }
  const serverCookie = await buildServerCookieHeader();
  const res = await fetch(adminUrl(path, params), {
    ...rest,
    body,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(serverCookie ? { Cookie: serverCookie } : {}),
      ...(rest.headers ?? {}),
    },
    cache: rest.cache ?? "no-store",
  });
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) {
    const msg =
      (typeof parsed === "object" && parsed && "error" in parsed && typeof (parsed as { error: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : undefined) ?? `Request failed with ${res.status}`;
    throw new AdminApiError(msg, res.status, parsed);
  }
  return parsed as T;
}

export const swrFetcher = <T = unknown>(path: string) => adminFetch<T>(path);
