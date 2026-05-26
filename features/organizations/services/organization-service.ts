import { adminFetch, AdminApiError } from "@/lib/admin-fetch";
import type { DataResponse, ListResponse, Organization } from "@/types/admin";

export interface OrgListQuery {
  search?: string;
  country?: string;
  industry?: string;
  tier?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

function buildQuery(q: OrgListQuery): string {
  const u = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

export async function listOrganizations(q: OrgListQuery = {}): Promise<ListResponse<Organization>> {
  return adminFetch<ListResponse<Organization>>(`/organizations${buildQuery(q)}`);
}

export async function getOrganization(id: string): Promise<Organization | null> {
  try {
    const r = await adminFetch<DataResponse<Organization>>(`/organizations/${id}`);
    return r.data;
  } catch (err) {
    if (err instanceof AdminApiError && (err.status === 404 || err.status === 401 || err.status === 403)) return null;
    throw err;
  }
}
