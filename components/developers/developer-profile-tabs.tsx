"use client";

import * as React from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { TabPanel, Tabs, type TabItem } from "@/components/ui/tabs";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { Developer } from "@/types/admin";

const TABS: TabItem[] = [
  { value: "overview", label: "Overview", icon: "dashboard" },
  { value: "applications", label: "Projects", icon: "deployed_code" },
  { value: "organizations", label: "Organizations", icon: "domain" },
  { value: "team", label: "Team", icon: "groups" },
  { value: "billing", label: "Billing", icon: "credit_card" },
  { value: "sdk-usage", label: "SDK usage", icon: "package_2" },
  { value: "api-usage", label: "API usage", icon: "bolt" },
  { value: "trust", label: "Trust metrics", icon: "verified_user" },
  { value: "verifications", label: "Verifications", icon: "task_alt" },
  { value: "security", label: "Security", icon: "shield" },
  { value: "fraud", label: "Fraud", icon: "gpp_bad" },
  { value: "audit", label: "Audit", icon: "manage_search" },
  { value: "compliance", label: "Compliance", icon: "policy" },
  { value: "geo", label: "Geographic", icon: "public" },
  { value: "telecom", label: "Telecom", icon: "cell_tower" },
  { value: "dependencies", label: "Dependencies", icon: "account_tree" },
  { value: "risk", label: "Risk", icon: "warning" },
];

export function DeveloperProfileTabs({ developer }: { developer: Developer }) {
  const [active, setActive] = React.useState<string>("overview");
  return (
    <Tabs items={TABS} value={active} onValueChange={setActive}>
      {TABS.map((t) => (
        <TabPanel key={t.value} value={t.value} className="ds-tabs__content">
          {t.value === "overview" ? <OverviewTab developer={developer} /> : <DynamicTab id={developer.id} tab={t.value} />}
        </TabPanel>
      ))}
    </Tabs>
  );
}

// ─── Overview tab uses the developer object directly ─────────────────────────
function OverviewTab({ developer }: { developer: Developer }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      <Panel title="Identity" icon="badge">
        <DefList rows={[
          ["Subscription hash", <span key="h" className="font-mono text-[var(--keyra-accent)]">{developer.subscription_hash ?? "—"}</span>],
          ["Username", `@${developer.username ?? "—"}`],
          ["Email", developer.professional_email],
          ["Mobile", developer.mobile_phone],
          ["Created", formatDate(developer.created_at)],
          ["Last activity", formatRelativeTime(developer.last_activity_at)],
        ]} />
      </Panel>
      <Panel title="Trust & verification" icon="verified_user">
        <DefList rows={[
          ["Trust score", developer.trust_score ?? "—"],
          ["Verification", <StatusPill key="v" value={developer.verification_status} />],
          ["Human verification", <StatusPill key="h" value={developer.human_verification_status} />],
          ["KYC", <StatusPill key="k" value={developer.kyc_status} />],
          ["Compliance", <StatusPill key="c" value={developer.compliance_status} />],
          ["Telecom identity", <StatusPill key="t" value={developer.telecom_identity_status} />],
        ]} />
      </Panel>
      <Panel title="Business" icon="payments">
        <DefList rows={[
          ["Enterprise tier", developer.enterprise_tier?.toUpperCase() ?? "—"],
          ["Lifecycle stage", <StatusPill key="l" value={developer.lifecycle_stage} />],
          ["Revenue contribution", formatCurrency(Number(developer.revenue_contribution_usd ?? 0))],
          ["API calls 24h", formatNumber(Number(developer.api_calls_24h ?? 0), { compact: true })],
          ["AI usage index", developer.ai_usage_index ?? "—"],
          ["Reputation index", developer.reputation_index ?? "—"],
        ]} />
      </Panel>
      <Panel title="Geographic" icon="public" className="xl:col-span-2">
        <DefList rows={[
          ["Country", developer.country_iso2 ?? "—"],
          ["Region", developer.region ?? "—"],
          ["City", developer.city ?? "—"],
          ["Industry", developer.industry_slug?.replace(/_/g, " ") ?? "—"],
        ]} />
      </Panel>
      <Panel title="Operational" icon="device_hub">
        <DefList rows={[
          ["Projects", formatNumber(developer.application_count)],
          ["Organizations", formatNumber(developer.organization_count)],
          ["Team size", formatNumber(developer.team_size)],
          ["Fraud risk", <Badge key="f" tone={(developer.fraud_risk_score ?? 0) > 60 ? "critical" : "muted"}>{developer.fraud_risk_score ?? "—"}</Badge>],
          ["Account status", <StatusPill key="s" value={developer.account_status} />],
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

// ─── Lazy-loaded tab using /admin/global/developers/:id/:tab ─────────────────
function DynamicTab({ id, tab }: { id: string; tab: string }) {
  const { data, isLoading, error } = useSWR<{ ok: true; tab: string; data: unknown }>(`/developers/${id}/${tab}`, swrFetcher);
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} />;
  const payload = data?.data;
  if (!payload) return <EmptyState tab={tab} />;
  if (Array.isArray(payload)) {
    if (payload.length === 0) return <EmptyState tab={tab} />;
    return <AutoTable rows={payload as Record<string, unknown>[]} tab={tab} />;
  }
  return <AutoCard data={payload as Record<string, unknown>} tab={tab} />;
}

function LoadingState() {
  return (
    <div className="ds-panel p-8 text-center text-[var(--ds-muted)]">
      <MaterialIcon name="hourglass" size={16} /> Loading…
    </div>
  );
}
function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="ds-panel p-10 text-center">
      <MaterialIcon name="inbox" size={20} className="text-[var(--ds-muted)]" />
      <div className="mt-2 text-[13px] text-[var(--ds-ink)]">No {tab.replace(/-/g, " ")} data yet</div>
      <div className="text-[11.5px] text-[var(--ds-muted)] mt-1">
        Seed fixtures with <Link href="/login" className="text-[var(--keyra-accent)]">npm run seed:keyra-admin</Link>.
      </div>
    </div>
  );
}
function ErrorState({ message }: { message: string }) {
  return <div className="ds-panel p-6 text-[12.5px] text-[var(--ds-error)]">Failed to load: {message}</div>;
}

// ─── AutoTable renders any tab payload that's an array of records ────────────
const COLUMN_HINTS: Record<string, string[]> = {
  applications: ["name", "platform", "environment", "status", "active_api_key_count", "updated_at"],
  organizations: ["name", "industry_slug", "country_iso2", "enterprise_tier", "application_count", "role"],
  team: ["display_name", "professional_email", "role", "created_at"],
  billing: ["cardholder_name", "card_type", "last_four_digits", "is_default", "created_at"],
  "sdk-usage": ["name", "platform", "project_count", "installed_at"],
  "api-usage": ["application_name", "endpoint", "method", "status_code", "latency_ms", "occurred_at"],
  "ai-agents": ["name", "model_type", "trust_rating", "status", "api_consumption_24h", "escalation_count"],
  trust: ["verification_type", "outcome", "trust_delta", "occurred_at"],
  verifications: ["event_type", "outcome", "channel", "occurred_at"],
  security: ["event_category", "severity", "status", "description", "occurred_at"],
  fraud: ["fraud_type", "severity", "status", "blocked", "detected_at"],
  audit: ["action", "target_type", "target_id", "ip_address", "occurred_at"],
  compliance: ["reason", "severity", "status", "opened_at", "closed_at"],
  telecom: ["project_name", "callback_url", "platform", "environment", "status", "active_keys"],
  dependencies: ["name", "platform", "trust_status", "api_key_count"],
  notifications: ["title", "delivered_at", "read_at"],
  outreach: ["campaign_name", "stage", "engagement_score", "adoption_likelihood", "last_touched_at"],
};

function AutoTable({ rows, tab }: { rows: Record<string, unknown>[]; tab: string }) {
  const cols = COLUMN_HINTS[tab] ?? Object.keys(rows[0] ?? {}).slice(0, 8);
  return (
    <div className="ds-table-wrap">
      <table className="ds-table ds-table--compact">
        <thead>
          <tr>{cols.map((c) => <th key={c}>{prettyColumn(c)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {cols.map((c) => (
                <td key={c}>{renderCell(row, c)}</td>
              ))}
            </tr>
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

function renderCell(row: Record<string, unknown>, c: string): React.ReactNode {
  return renderValue(row[c], c);
}

function renderValue(v: unknown, key?: string): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-[var(--ds-muted)]">—</span>;
  if (typeof v === "boolean") return <Badge tone={v ? "success" : "muted"}>{String(v)}</Badge>;
  const keyLower = (key ?? "").toLowerCase();
  if (keyLower.endsWith("_at") || keyLower === "created_at" || keyLower === "updated_at") {
    return <span className="font-mono text-[11px]">{formatRelativeTime(String(v))}</span>;
  }
  if (keyLower.includes("status") || keyLower.includes("severity") || keyLower.includes("outcome") || keyLower.includes("stage")) {
    return <StatusPill value={String(v)} />;
  }
  if (keyLower.includes("revenue") || keyLower.includes("usd")) {
    return <span className="font-mono tabular-nums">{formatCurrency(Number(v))}</span>;
  }
  if (typeof v === "number" || /^-?\d+(\.\d+)?$/.test(String(v))) {
    return <span className="font-mono tabular-nums">{formatNumber(Number(v))}</span>;
  }
  if (typeof v === "object") return <span className="font-mono text-[10.5px] text-[var(--ds-muted)]">{JSON.stringify(v).slice(0, 80)}</span>;
  return <span className="text-[12px]">{String(v)}</span>;
}
