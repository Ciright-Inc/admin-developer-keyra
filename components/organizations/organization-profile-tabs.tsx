"use client";

import * as React from "react";
import useSWR from "swr";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { TabPanel, Tabs, type TabItem } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, formatPercent, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { Organization } from "@/types/admin";

const TABS: TabItem[] = [
  { value: "overview", label: "Overview", icon: "dashboard" },
  { value: "teams", label: "Teams", icon: "groups" },
  { value: "applications", label: "Projects", icon: "deployed_code" },
  { value: "telecom", label: "Telecom", icon: "cell_tower" },
  { value: "identity", label: "Identity infra", icon: "key" },
  { value: "financials", label: "Financials", icon: "payments" },
  { value: "audit", label: "Audit history", icon: "manage_search" },
];

export function OrganizationProfileTabs({ organization }: { organization: Organization }) {
  const [active, setActive] = React.useState("overview");
  return (
    <Tabs items={TABS} value={active} onValueChange={setActive}>
      {TABS.map((t) => (
        <TabPanel key={t.value} value={t.value} className="ds-tabs__content">
          {t.value === "overview" ? <OverviewTab organization={organization} /> : <DynamicTab id={organization.id} tab={t.value} />}
        </TabPanel>
      ))}
    </Tabs>
  );
}

function OverviewTab({ organization: o }: { organization: Organization }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      <Panel title="Identity" icon="domain">
        <DefList rows={[
          ["Name", o.name],
          ["Slug", <span key="s" className="font-mono">{o.slug}</span>],
          ["Industry", o.industry_slug?.replace(/_/g, " ") ?? "—"],
          ["Country", o.country_iso2 ?? "—"],
          ["Region", o.region],
          ["City", o.city],
          ["Website", o.website ?? "—"],
        ]} />
      </Panel>
      <Panel title="Commercial" icon="payments">
        <DefList rows={[
          ["Enterprise tier", <Badge key="t" tone="accent">{o.enterprise_tier.toUpperCase()}</Badge>],
          ["Revenue tier", o.revenue_tier],
          ["Monthly recurring", formatCurrency(Number(o.monthly_recurring_revenue_usd))],
          ["API utilization", formatPercent(Number(o.api_utilization_pct))],
          ["Developer count", formatNumber(o.developer_count)],
          ["Project count", formatNumber(o.application_count)],
        ]} />
      </Panel>
      <Panel title="Trust & risk" icon="verified_user">
        <DefList rows={[
          ["Verification rating", <span key="v" className="font-mono">{o.verification_rating}</span>],
          ["Security score", <Badge key="s" tone={o.security_score > 80 ? "success" : "warning"}>{o.security_score}</Badge>],
          ["Operational risk", <Badge key="r" tone={o.operational_risk_score > 60 ? "critical" : "muted"}>{o.operational_risk_score}</Badge>],
          ["Compliance level", <StatusPill key="c" value={o.compliance_level} />],
          ["Telecom integration", <StatusPill key="t" value={o.telecom_integration_status} />],
          ["Status", <StatusPill key="st" value={o.status} />],
        ]} />
      </Panel>
    </div>
  );
}

function DefList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-3 text-[12.5px]">
      {rows.map(([k, v], i) => (
        <React.Fragment key={i}>
          <dt className="text-[var(--ds-muted)]">{k}</dt>
          <dd className="text-[var(--ds-ink)] truncate">{v ?? "—"}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function DynamicTab({ id, tab }: { id: string; tab: string }) {
  const { data, isLoading } = useSWR<{ ok: true; data: unknown }>(`/organizations/${id}/${tab}`, swrFetcher);
  if (isLoading) return <Panel><div className="text-center text-[var(--ds-muted)] py-4"><MaterialIcon name="hourglass" size={14}/> Loading…</div></Panel>;
  const payload = data?.data;
  if (!payload || (Array.isArray(payload) && payload.length === 0)) {
    return (
      <Panel>
        <div className="text-center py-10">
          <MaterialIcon name="inbox" size={20} className="text-[var(--ds-muted)]"/>
          <div className="mt-2 text-[12.5px] text-[var(--ds-muted)]">No {tab.replace(/-/g, " ")} data yet</div>
        </div>
      </Panel>
    );
  }
  if (Array.isArray(payload)) {
    return <AutoTable rows={payload as Record<string, unknown>[]} tab={tab} />;
  }
  return <AutoCard data={payload as Record<string, unknown>} tab={tab} />;
}

const COL_HINTS: Record<string, string[]> = {
  teams: ["display_name", "professional_email", "developer_account_id", "role", "created_at"],
  applications: ["name", "platform", "environment", "status", "active_api_key_count", "daily_api_calls", "updated_at"],
  telecom: ["project_name", "callback_url", "environment", "status", "active_keys"],
  audit: ["action", "target_type", "target_id", "occurred_at"],
};

function AutoTable({ rows, tab }: { rows: Record<string, unknown>[]; tab: string }) {
  const cols = COL_HINTS[tab] ?? Object.keys(rows[0] ?? {}).slice(0, 8);
  return (
    <div className="ds-table-wrap">
      <table className="ds-table ds-table--compact">
        <thead><tr>{cols.map((c) => <th key={c}>{prettyColumn(c)}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>{cols.map((c) => <td key={c}>{renderValue(r[c], c)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AutoCard({ data, tab }: { data: Record<string, unknown>; tab: string }) {
  return (
    <Panel title={prettyColumn(tab)} icon="info">
      <dl className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-[12.5px]">
        {Object.entries(data).map(([k, v]) => (
          <div key={k}>
            <dt className="text-[var(--ds-muted)] text-[10.5px] uppercase tracking-wide mb-0.5">{prettyColumn(k)}</dt>
            <dd className="text-[var(--ds-ink)] font-medium">{renderValue(v, k)}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function prettyColumn(c: string): string {
  return c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function renderValue(v: unknown, key?: string): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-[var(--ds-muted)]">—</span>;
  if (typeof v === "boolean") return <Badge tone={v ? "success" : "muted"}>{String(v)}</Badge>;
  const keyLower = (key ?? "").toLowerCase();
  if (keyLower.endsWith("_at")) return <span className="font-mono text-[11px]">{formatRelativeTime(String(v))}</span>;
  if (keyLower.includes("status") || keyLower.includes("severity") || keyLower.includes("outcome")) return <StatusPill value={String(v)} />;
  if (keyLower.includes("revenue") || keyLower.includes("usd")) return <span className="font-mono tabular-nums">{formatCurrency(Number(v))}</span>;
  if (typeof v === "number" || /^-?\d+(\.\d+)?$/.test(String(v))) return <span className="font-mono tabular-nums">{formatNumber(Number(v))}</span>;
  if (typeof v === "object") return <span className="font-mono text-[10.5px]">{JSON.stringify(v).slice(0, 80)}</span>;
  return <span>{String(v)}</span>;
}
