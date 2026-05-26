import { adminFetch, AdminApiError } from "@/lib/admin-fetch";
import type { DataResponse, Developer, ListResponse } from "@/types/admin";

export interface DeveloperListQuery {
  search?: string;
  country?: string;
  industry?: string;
  status?: string;
  lifecycle?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

function buildQuery(q: DeveloperListQuery): string {
  const u = new URLSearchParams();
  if (q.search) u.set("search", q.search);
  if (q.country) u.set("country", q.country);
  if (q.industry) u.set("industry", q.industry);
  if (q.status) u.set("status", q.status);
  if (q.lifecycle) u.set("lifecycle", q.lifecycle);
  if (q.sort) u.set("sort", q.sort);
  if (q.page) u.set("page", String(q.page));
  if (q.limit) u.set("limit", String(q.limit));
  const s = u.toString();
  return s ? `?${s}` : "";
}

export async function listDevelopers(query: DeveloperListQuery = {}): Promise<ListResponse<Developer>> {
  return adminFetch<ListResponse<Developer>>(`/developers${buildQuery(query)}`);
}

export async function getDeveloper(id: string): Promise<Developer | null> {
  try {
    const r = await adminFetch<DataResponse<Developer>>(`/developers/${id}`);
    return r.data;
  } catch (err) {
    if (err instanceof AdminApiError && (err.status === 404 || err.status === 401 || err.status === 403)) return null;
    throw err;
  }
}

export async function getDeveloperTab<T = unknown>(id: string, tab: string): Promise<T> {
  const r = await adminFetch<{ ok: true; tab: string; data: T }>(`/developers/${id}/${tab}`);
  return r.data;
}

export async function suspendDeveloper(id: string, reason?: string): Promise<void> {
  await adminFetch(`/developers/${id}/suspend`, { method: "POST", body: { reason } });
}
export async function verifyDeveloper(id: string): Promise<void> {
  await adminFetch(`/developers/${id}/verify`, { method: "POST" });
}
export async function escalateDeveloper(id: string, reason?: string, severity = "medium"): Promise<void> {
  await adminFetch(`/developers/${id}/escalate`, { method: "POST", body: { reason, severity } });
}
export async function resetDeveloperApiKeys(id: string): Promise<void> {
  await adminFetch(`/developers/${id}/reset-api-keys`, { method: "POST" });
}
