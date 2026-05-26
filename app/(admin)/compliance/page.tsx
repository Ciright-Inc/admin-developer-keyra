"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { adminFetch, swrFetcher } from "@/lib/admin-fetch";
import type { ComplianceEscalation, ComplianceRecord, ListResponse } from "@/types/admin";

export default function CompliancePage() {
  const records = useSWR<ListResponse<ComplianceRecord>>("/compliance/records?page=1&limit=50", swrFetcher);
  const escalations = useSWR<{ ok: true; items: ComplianceEscalation[] }>("/compliance/escalations", swrFetcher, { refreshInterval: 10000 });

  const updateEscalation = async (id: string, status: string) => {
    try {
      await adminFetch(`/compliance/escalations/${id}`, { method: "PATCH", body: { status } });
      toast.success(`Escalation ${status}`);
      void escalations.mutate();
    } catch (err) {
      toast.error(`Update failed: ${(err as Error).message}`);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // COMPLIANCE CENTER</span><Badge tone="warning" dot>ACTIVE</Badge></>}
        title="Compliance command"
        subtitle="GDPR, eIDAS, SOC2, ISO 27001, HIPAA, PSD2, NIS2, NIST and sovereign frameworks — attestations, renewals and open escalations."
      />

      <Panel title="Open compliance escalations" icon="warning" subtitle={`${(escalations.data?.items ?? []).filter((e) => e.status === "open").length} open`} bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Reason</th><th>Severity</th><th>Status</th><th>Organization</th><th>Developer</th><th>Opened</th><th></th></tr></thead>
            <tbody>
              {(escalations.data?.items ?? []).map((e) => (
                <tr key={e.id}>
                  <td className="text-[var(--ds-ink)] font-medium">{e.reason}</td>
                  <td><StatusPill value={e.severity} /></td>
                  <td><StatusPill value={e.status} /></td>
                  <td>{e.organization_name ?? "—"}</td>
                  <td>{e.developer_name ?? "—"}</td>
                  <td className="text-[11.5px] font-mono">{formatRelativeTime(e.opened_at)}</td>
                  <td>
                    {e.status === "open" ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => updateEscalation(e.id, "investigating")}>Investigate</Button>
                        <Button size="sm" variant="accent" onClick={() => updateEscalation(e.id, "resolved")}>Resolve</Button>
                      </div>
                    ) : <Badge tone="muted">closed</Badge>}
                  </td>
                </tr>
              ))}
              {escalations.isLoading && <tr><td colSpan={7} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
              {!escalations.isLoading && (escalations.data?.items ?? []).length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--ds-success)]"><MaterialIcon name="check_circle" size={14} /> All escalations resolved</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Compliance records" icon="policy" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Framework</th><th>Organization</th><th>Status</th><th>Attested</th><th>Expires</th></tr></thead>
            <tbody>
              {(records.data?.items ?? []).map((r) => (
                <tr key={r.id}>
                  <td><Badge tone="accent">{r.framework}</Badge></td>
                  <td>{r.organization_name ?? "—"}</td>
                  <td><StatusPill value={r.status} /></td>
                  <td className="text-[11.5px] font-mono">{r.attested_at ? formatDate(r.attested_at) : "—"}</td>
                  <td className="text-[11.5px] font-mono">{r.expires_at ? formatDate(r.expires_at) : "—"}</td>
                </tr>
              ))}
              {records.isLoading && <tr><td colSpan={5} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
