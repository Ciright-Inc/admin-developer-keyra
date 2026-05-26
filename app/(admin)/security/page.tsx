"use client";

import * as React from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { FraudEvent, ListResponse, SecurityEvent } from "@/types/admin";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "suspicious_api", label: "Suspicious API" },
  { value: "bot", label: "Bots" },
  { value: "credential", label: "Credential" },
  { value: "synthetic_identity", label: "Synthetic identity" },
  { value: "telecom_fraud", label: "Telecom fraud" },
  { value: "ai_manipulation", label: "AI manipulation" },
  { value: "abuse", label: "Abuse" },
];

export default function SecurityPage() {
  const [category, setCategory] = React.useState("");
  const [severity, setSeverity] = React.useState("");

  const summary = useSWR<{ ok: true; items: { event_category: string; severity: string; c: number }[] }>("/security/summary", swrFetcher, { refreshInterval: 10000 });

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (severity) qs.set("severity", severity);
  qs.set("page", "1"); qs.set("limit", "50");
  const events = useSWR<ListResponse<SecurityEvent>>(`/security/events?${qs}`, swrFetcher, { refreshInterval: 8000 });
  const fraud = useSWR<ListResponse<FraudEvent>>(`/security/fraud?page=1&limit=20`, swrFetcher, { refreshInterval: 12000 });

  const totals = React.useMemo(() => {
    const items = summary.data?.items ?? [];
    return CATEGORIES.slice(1).map((c) => ({
      category: c.value,
      label: c.label,
      total: items.filter((i) => i.event_category === c.value).reduce((a, b) => a + b.c, 0),
      critical: items.filter((i) => i.event_category === c.value && i.severity === "critical").reduce((a, b) => a + b.c, 0),
    }));
  }, [summary.data]);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // SECURITY OPERATIONS</span><Badge tone="critical" dot>LIVE</Badge></>}
        title="Security Operations Center"
        subtitle="Real-time monitoring of suspicious API usage, bots, credential stuffing, synthetic identity, telecom fraud, AI manipulation and abuse."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {totals.map((t) => (
          <Panel key={t.category} title={t.label} icon="shield">
            <div className="text-[22px] font-semibold font-mono tabular-nums">{formatNumber(t.total)}</div>
            <div className="text-[10.5px] text-[var(--ds-muted)] mt-1">last 24h{t.critical ? <span className="text-[var(--ds-error)] ml-1.5">{t.critical} critical</span> : null}</div>
          </Panel>
        ))}
      </div>

      <Panel
        title="Live security events"
        icon="report"
        bodyClassName="!p-0"
        flush
        actions={
          <div className="flex items-center gap-2">
            <select className="ds-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select className="ds-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="">Severity (all)</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => void events.mutate()}><MaterialIcon name="refresh" size={13}/> Refresh</Button>
          </div>
        }
      >
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Category</th><th>Severity</th><th>Status</th><th>Description</th><th>When</th></tr></thead>
            <tbody>
              {(events.data?.items ?? []).map((e) => (
                <tr key={e.id}>
                  <td><Badge tone="muted">{e.event_category}</Badge></td>
                  <td><StatusPill value={e.severity} /></td>
                  <td><StatusPill value={e.status} /></td>
                  <td className="text-[12px] text-[var(--ds-body)] truncate max-w-[500px]">{e.description}</td>
                  <td className="text-[11.5px] font-mono">{formatRelativeTime(e.occurred_at)}</td>
                </tr>
              ))}
              {events.isLoading && <tr><td colSpan={5} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent fraud detections" icon="gpp_bad" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Type</th><th>Severity</th><th>Status</th><th>Blocked</th><th>Detected</th></tr></thead>
            <tbody>
              {(fraud.data?.items ?? []).map((f) => (
                <tr key={f.id}>
                  <td><Badge tone="muted">{f.fraud_type}</Badge></td>
                  <td><StatusPill value={f.severity} /></td>
                  <td><StatusPill value={f.status} /></td>
                  <td>{f.blocked ? <Badge tone="success" dot>BLOCKED</Badge> : <Badge tone="warning">PASSED</Badge>}</td>
                  <td className="text-[11.5px] font-mono">{formatRelativeTime(f.detected_at)}</td>
                </tr>
              ))}
              {fraud.isLoading && <tr><td colSpan={5} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
