import { adminFetch, AdminApiError } from "@/lib/admin-fetch";
import type { DataResponse, ListResponse, SdkCatalogue, SdkVersion } from "@/types/admin";

export interface SdkListQuery {
  search?: string;
  platform?: string;
  status?: string;
  page?: number;
  limit?: number;
}

function buildQuery(q: SdkListQuery): string {
  const u = new URLSearchParams();
  if (q.search) u.set("search", q.search);
  if (q.platform) u.set("platform", q.platform);
  if (q.status) u.set("status", q.status);
  if (q.page) u.set("page", String(q.page));
  if (q.limit) u.set("limit", String(q.limit));
  const s = u.toString();
  return s ? `?${s}` : "";
}

export type SdkCatalogueInput = {
  name: string;
  slug?: string;
  platform?: string;
  language?: string;
  install_command?: string;
  quick_start?: string;
  status?: string;
  repository_url?: string | null;
  package_manager?: string;
  description?: string;
  featured?: boolean;
  sort_order?: number;
};

export async function listSdks(query: SdkListQuery = {}): Promise<ListResponse<SdkCatalogue>> {
  return adminFetch<ListResponse<SdkCatalogue>>(`/sdks${buildQuery(query)}`);
}

export async function getSdk(id: string): Promise<SdkCatalogue | null> {
  try {
    const r = await adminFetch<DataResponse<SdkCatalogue>>(`/sdks/${id}`);
    return r.data;
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createSdk(input: SdkCatalogueInput): Promise<SdkCatalogue> {
  const r = await adminFetch<DataResponse<SdkCatalogue>>("/sdks", { method: "POST", body: input });
  return r.data;
}

export async function updateSdk(id: string, input: Partial<SdkCatalogueInput>): Promise<SdkCatalogue> {
  const r = await adminFetch<DataResponse<SdkCatalogue>>(`/sdks/${id}`, { method: "PATCH", body: input });
  return r.data;
}

export async function deprecateSdk(id: string): Promise<SdkCatalogue> {
  const r = await adminFetch<DataResponse<SdkCatalogue>>(`/sdks/${id}/deprecate`, { method: "POST" });
  return r.data;
}

export async function deleteSdk(id: string): Promise<void> {
  await adminFetch(`/sdks/${id}`, { method: "DELETE" });
}

export async function listVersions(sdkId: string): Promise<SdkVersion[]> {
  const r = await adminFetch<{ ok: true; items: SdkVersion[] }>(`/sdks/${sdkId}/versions`);
  return r.items;
}

export async function createVersion(
  sdkId: string,
  input: { version: string; changelog?: string; publish_now?: boolean },
): Promise<SdkVersion> {
  const r = await adminFetch<DataResponse<SdkVersion>>(`/sdks/${sdkId}/versions`, { method: "POST", body: input });
  return r.data;
}

export async function publishVersion(sdkId: string, versionId: string): Promise<SdkVersion> {
  const r = await adminFetch<DataResponse<SdkVersion>>(`/sdks/${sdkId}/versions/${versionId}/publish`, {
    method: "POST",
  });
  return r.data;
}
