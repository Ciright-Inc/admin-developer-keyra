"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { developerPortalUrl } from "@/lib/developer-portal-url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { TabPanel, Tabs, type TabItem } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, formatDate, formatRelativeTime, shortHash } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import { revokeApplication, suspendApplication, type AppApiKey } from "@/features/applications/services/application-service";
import type { Application } from "@/types/admin";

const TABS: TabItem[] = [
  { value: "overview", label: "Overview", icon: "dashboard" },
  { value: "credentials", label: "API keys", icon: "vpn_key" },
  { value: "telemetry", label: "Telemetry", icon: "bolt" },
  { value: "trust", label: "Trust & verification", icon: "verified_user" },
  { value: "fraud", label: "Fraud & security", icon: "gpp_bad" },
  { value: "compliance", label: "Compliance", icon: "policy" },
  { value: "audit", label: "Audit", icon: "manage_search" },
];

export function ApplicationProfile({
  application,
  onChanged,
}: {
  application: Application;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = React.useState("overview");
  const ideUrl = developerPortalUrl(`/projects/${application.id}`);

  const onSuspend = async () => {
    try {
      await suspendApplication(application.id);
      toast.success("Project archived");
      onChanged?.();
      router.refresh();
    } catch (e) {
      toast.error(`Suspend failed: ${(e as Error).message}`);
    }
  };
  const onRevoke = async () => {
    try {
      await revokeApplication(application.id);
      toast.success("All API keys revoked");
      onChanged?.();
      router.refresh();
    } catch (e) {
      toast.error(`Revoke failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ApplicationHeader application={application} ideUrl={ideUrl} onSuspend={onSuspend} onRevoke={onRevoke} />
      <Tabs items={TABS} value={active} onValueChange={setActive}>
        <TabPanel value="overview" className="ds-tabs__content"><OverviewTab a={application} /></TabPanel>
        <TabPanel value="credentials" className="ds-tabs__content"><CredentialsTab id={application.id} /></TabPanel>
        <TabPanel value="telemetry" className="ds-tabs__content"><TelemetryTab a={application} /></TabPanel>
        <TabPanel value="trust" className="ds-tabs__content"><TrustTab a={application} /></TabPanel>
        <TabPanel value="fraud" className="ds-tabs__content"><FraudTab a={application} /></TabPanel>
        <TabPanel value="compliance" className="ds-tabs__content"><ComplianceTab a={application} /></TabPanel>
        <TabPanel value="audit" className="ds-tabs__content"><AuditTab id={application.id} /></TabPanel>
      </Tabs>
    </div>
  );
}

function ApplicationHeader({
  application: a,
  ideUrl,
  onSuspend,
  onRevoke,
}: {
  application: Application;
  ideUrl: string;
  onSuspend: () => void | Promise<void>;
  onRevoke: () => void | Promise<void>;
}) {
  return (
    <section className="ds-profile-header flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
      <div className="flex items-start gap-4 min-w-0">
        <div className="ds-avatar"><MaterialIcon name="deployed_code" size={26} /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] font-semibold text-[var(--ds-ink)] truncate">{a.name}</h2>
            <StatusPill value={a.status} />
            <Badge tone="muted">{a.platform.replace(/_/g, " ").toUpperCase()}</Badge>
            <StatusPill value={a.trust_status} />
          </div>
          <div className="mt-1.5 text-[12px] text-[var(--ds-muted)] font-mono truncate">{a.slug} · {a.organization_name ?? "—"}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {a.human_identity_enforcement && <Badge tone="success" dot>HUMAN IDENTITY</Badge>}
            {a.consent_enforcement && <Badge tone="success" dot>CONSENT</Badge>}
            {a.telecom_verification_enabled && <Badge tone="accent">TELECOM</Badge>}
            {a.sim_identity_enabled && <Badge tone="accent">SIM IDENTITY</Badge>}
            <Badge tone="muted">{a.data_classification.toUpperCase()}</Badge>
            <Badge tone="muted">{a.compliance_status.toUpperCase()}</Badge>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
        <Stat label="Listing downloads" value={formatNumber(Number(a.monthly_active_users), { compact: true })} />
        <Stat label="API calls 24h" value={formatNumber(Number(a.daily_api_calls), { compact: true })} />
        <Stat label="Active keys" value={formatNumber(Number(a.active_api_key_count ?? a.api_key_count ?? 0))} />
        <Stat label="Updated" value={formatRelativeTime(a.updated_at)} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => window.open(ideUrl, "_blank", "noopener,noreferrer")}>
          <MaterialIcon name="open_in_new" size={14}/> Open in IDE
        </Button>
        <Button variant="ghost" onClick={onSuspend}><MaterialIcon name="pause" size={14}/> Suspend</Button>
        <Button variant="danger" onClick={onRevoke}><MaterialIcon name="vpn_key_off" size={14}/> Revoke keys</Button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="ds-stat-pair">
      <span className="ds-stat-pair__label">{label}</span>
      <span className="ds-stat-pair__value">{value}</span>
    </div>
  );
}

function OverviewTab({ a }: { a: Application }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      <Panel title="Manifest" icon="badge">
        <DefList rows={[
          ["Name", a.name],
          ["Slug", <span key="s" className="font-mono">{a.slug}</span>],
          ["Platform", a.platform.replace(/_/g, " ")],
          ["Status", <StatusPill key="st" value={a.status} />],
          ["Trust", <StatusPill key="tr" value={a.trust_status} />],
          ["Verification", <StatusPill key="v" value={a.verification_status} />],
          ["Classification", <Badge key="c" tone="muted">{a.data_classification}</Badge>],
          ["Created", formatDate(a.created_at)],
          ["Updated", formatRelativeTime(a.updated_at)],
        ]} />
      </Panel>
      <Panel title="Operational" icon="bolt">
        <DefList rows={[
          ["Monthly active users", formatNumber(Number(a.monthly_active_users))],
          ["Daily API calls", formatNumber(Number(a.daily_api_calls))],
          ["Revenue generated", formatCurrency(Number(a.revenue_generated_usd))],
          ["Fraud events 24h", a.fraud_events_24h],
          ["Compliance status", <StatusPill key="c" value={a.compliance_status} />],
          ["Last deployment", formatRelativeTime(a.last_deployment_at)],
        ]} />
      </Panel>
      <Panel title="Identity enforcement" icon="lock">
        <DefList rows={[
          ["Human identity", a.human_identity_enforcement ? <Badge key="h" tone="success" dot>Required</Badge> : <Badge key="h" tone="muted">Optional</Badge>],
          ["Consent enforcement", a.consent_enforcement ? <Badge key="c" tone="success" dot>Required</Badge> : <Badge key="c" tone="muted">Optional</Badge>],
          ["Telecom verification", a.telecom_verification_enabled ? <Badge key="t" tone="accent">Enabled</Badge> : <Badge key="t" tone="muted">Disabled</Badge>],
          ["SIM identity", a.sim_identity_enabled ? <Badge key="s" tone="accent">Enabled</Badge> : <Badge key="s" tone="muted">Disabled</Badge>],
        ]} />
      </Panel>
    </div>
  );
}

function DefList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-3 text-[12.5px]">
      {rows.map(([k, v], i) => (
        <React.Fragment key={i}>
          <dt className="text-[var(--ds-muted)]">{k}</dt>
          <dd className="text-[var(--ds-ink)] truncate">{v ?? "—"}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function CredentialsTab({ id }: { id: string }) {
  const { data, isLoading } = useSWR<{ ok: true; items: AppApiKey[] }>(`/applications/${id}/keys`, swrFetcher);
  const keys = data?.items ?? [];
  return (
    <Panel title="API keys" icon="vpn_key" subtitle={`${keys.length} configured`}>
      {isLoading ? <div className="py-6 text-center text-[var(--ds-muted)]">Loading…</div> :
       keys.length === 0 ? <div className="py-6 text-center text-[var(--ds-muted)]">No API keys yet.</div> :
       <div className="ds-table-wrap !rounded-md">
         <table className="ds-table ds-table--compact">
           <thead><tr><th>Name</th><th>Type</th><th>Client ID</th><th>Prefix</th><th>Environment</th><th>Status</th><th>Last used</th><th>Created</th></tr></thead>
           <tbody>
             {keys.map((k) => (
               <tr key={k.id}>
                 <td>{k.name ?? "—"}</td>
                 <td><Badge tone="muted">{k.type ?? "—"}</Badge></td>
                 <td className="font-mono text-[11px]">{k.client_id ?? "—"}</td>
                 <td className="font-mono">{k.prefix}…{shortHash(k.hashed_key, 6)}</td>
                 <td><Badge tone={k.environment === "production" ? "accent" : "muted"}>{k.environment}</Badge></td>
                 <td><StatusPill value={k.status} /></td>
                 <td className="text-[11.5px]">{formatRelativeTime(k.last_used_at)}</td>
                 <td className="text-[11.5px]">{formatDate(k.created_at)}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>}
    </Panel>
  );
}

function TelemetryTab({ a }: { a: Application }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Panel title="API calls (24h)" icon="bolt"><div className="text-[26px] font-semibold text-[var(--ds-ink)] font-mono">{formatNumber(Number(a.daily_api_calls))}</div></Panel>
      <Panel title="Listing downloads" icon="groups"><div className="text-[26px] font-semibold text-[var(--ds-ink)] font-mono">{formatNumber(Number(a.monthly_active_users))}</div></Panel>
      <Panel title="API keys" icon="vpn_key"><div className="text-[26px] font-semibold text-[var(--ds-ink)] font-mono">{formatNumber(Number(a.active_api_key_count ?? 0))} active</div></Panel>
    </div>
  );
}

function TrustTab({ a }: { a: Application }) {
  return (
    <Panel title="Trust posture" icon="verified_user">
      <DefList rows={[
        ["Trust status", <StatusPill key="t" value={a.trust_status} />],
        ["Verification status", <StatusPill key="v" value={a.verification_status} />],
        ["Human identity enforcement", a.human_identity_enforcement ? "Required" : "Optional"],
        ["Telecom verification", a.telecom_verification_enabled ? "Enabled" : "Disabled"],
        ["SIM identity", a.sim_identity_enabled ? "Enabled" : "Disabled"],
      ]} />
    </Panel>
  );
}

function FraudTab({ a }: { a: Application }) {
  return (
    <Panel title="Fraud signals" icon="gpp_bad">
      <DefList rows={[
        ["Fraud events (24h)", a.fraud_events_24h],
        ["Status", <StatusPill key="s" value={a.status} />],
      ]} />
    </Panel>
  );
}

function ComplianceTab({ a }: { a: Application }) {
  return (
    <Panel title="Compliance" icon="policy">
      <DefList rows={[
        ["Status", <StatusPill key="s" value={a.compliance_status} />],
        ["Data classification", a.data_classification],
        ["Consent enforcement", a.consent_enforcement ? "Required" : "Optional"],
      ]} />
    </Panel>
  );
}

function AuditTab({ id }: { id: string }) {
  const { data, isLoading } = useSWR<{ ok: true; items: { id: number; action: string; occurred_at: string; payload: unknown }[] }>(
    `/audit-logs?target_type=project&target_id=${encodeURIComponent(id)}&page=1&limit=50`,
    swrFetcher,
  );
  const items = data?.items ?? [];
  return (
    <Panel title="Audit trail" icon="manage_search">
      {isLoading ? <div className="py-6 text-center text-[var(--ds-muted)]">Loading…</div> :
       items.length === 0 ? <div className="py-6 text-center text-[var(--ds-muted)]">No audit entries yet for this application.</div> :
       <div className="ds-table-wrap !rounded-md">
         <table className="ds-table ds-table--compact">
           <thead><tr><th>Action</th><th>When</th></tr></thead>
           <tbody>
             {items.map((e) => (
               <tr key={e.id}>
                 <td className="font-mono">{e.action}</td>
                 <td className="text-[11.5px]">{formatRelativeTime(e.occurred_at)}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>}
    </Panel>
  );
}
