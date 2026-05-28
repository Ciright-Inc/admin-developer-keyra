import { adminFetch, AdminApiError } from "@/lib/admin-fetch";
import type { Application, DataResponse, ListResponse } from "@/types/admin";

export interface AppListQuery {
  search?: string;
  platform?: string;
  status?: string;
  organization_id?: string;
  page?: number;
  limit?: number;
}

function buildQuery(q: AppListQuery): string {
  const u = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

export async function listApplications(q: AppListQuery = {}): Promise<ListResponse<Application>> {
  return adminFetch<ListResponse<Application>>(`/applications${buildQuery(q)}`);
}

export async function getApplication(id: string): Promise<Application | null> {
  try {
    const r = await adminFetch<DataResponse<Application>>(`/applications/${id}`);
    return r.data;
  } catch (err) {
    if (err instanceof AdminApiError && (err.status === 404 || err.status === 401 || err.status === 403)) return null;
    throw err;
  }
}

export async function suspendApplication(id: string): Promise<void> {
  await adminFetch(`/applications/${id}/suspend`, { method: "POST" });
}
export async function revokeApplication(id: string): Promise<void> {
  await adminFetch(`/applications/${id}/revoke`, { method: "POST" });
}

export interface AppApiKey {
  id: string;
  application_id: string;
  prefix: string;
  hashed_key: string;
  environment: string;
  scopes?: string[];
  type?: string;
  client_id?: string | null;
  name?: string | null;
  status: string;
  last_used_at: string | null;
  revoked_at?: string | null;
  created_at: string;
}
export async function listAppKeys(id: string): Promise<AppApiKey[]> {
  const r = await adminFetch<{ ok: true; items: AppApiKey[] }>(`/applications/${id}/keys`);
  return r.items;
}
