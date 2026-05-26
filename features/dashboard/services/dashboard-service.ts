import { adminFetch } from "@/lib/admin-fetch";
import type { DashboardSnapshot, DataResponse } from "@/types/admin";

export async function getDashboardSnapshot(): Promise<DashboardSnapshot | null> {
  try {
    const res = await adminFetch<DataResponse<DashboardSnapshot>>("/dashboard");
    return res.data;
  } catch {
    return null;
  }
}
