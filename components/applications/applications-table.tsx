"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import { revokeApplication, suspendApplication } from "@/features/applications/services/application-service";
import type { Application, ListResponse } from "@/types/admin";

const PLATFORMS = [
  { value: "ios", label: "iOS", icon: "apple" },
  { value: "android", label: "Android", icon: "android" },
  { value: "web", label: "Web", icon: "language" },
  { value: "ai_agent", label: "AI Agent", icon: "smart_toy" },
  { value: "api", label: "API", icon: "api" },
  { value: "enterprise_saas", label: "Enterprise SaaS", icon: "business" },
  { value: "metaverse", label: "Metaverse", icon: "view_in_ar" },
  { value: "telecom", label: "Telecom", icon: "cell_tower" },
  { value: "government", label: "Government", icon: "account_balance" },
  { value: "medical", label: "Medical", icon: "ecg_heart" },
  { value: "financial", label: "Financial", icon: "account_balance_wallet" },
  { value: "gaming", label: "Gaming", icon: "sports_esports" },
  { value: "autonomous_systems", label: "Autonomous", icon: "precision_manufacturing" },
];

const STATUSES = ["active", "sandbox", "suspended", "revoked", "archived"];

export function ApplicationsTable() {
  const [search, setSearch] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 30;

  const filterKey = `${search}|${platform}|${status}`;
  const [prevKey, setPrevKey] = React.useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setPage(1);
  }

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (platform) qs.set("platform", platform);
  if (status) qs.set("status", status);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const { data, isLoading, mutate } = useSWR<ListResponse<Application>>(`/applications?${qs}`, swrFetcher, { revalidateOnFocus: false });
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onRevoke = async (id: string) => {
    try { await revokeApplication(id); toast.success("Application revoked"); void mutate(); }
    catch (e) { toast.error(`Revoke failed: ${(e as Error).message}`); }
  };
  const onSuspend = async (id: string) => {
    try { await suspendApplication(id); toast.success("Application suspended"); void mutate(); }
    catch (e) { toast.error(`Suspend failed: ${(e as Error).message}`); }
  };

  return (
    <Panel
      title="Applications"
      icon="deployed_code"
      subtitle={`${formatNumber(total)} active deployments`}
      bodyClassName="!p-0"
      flush
      actions={<Button variant="ghost" size="sm" onClick={() => void mutate()}><MaterialIcon name="refresh" size={13}/> Refresh</Button>}
    >
      <div className="px-3 pt-3 flex flex-col gap-3">
        <div className="ds-filter-bar">
          <div className="relative">
            <MaterialIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search apps…" className="ds-input ds-input--icon" />
          </div>
          <select className="ds-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status (all)</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setPlatform(""); setStatus(""); }}>
            <MaterialIcon name="restart_alt" size={13} /> Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <PlatformChip label="All platforms" value="" active={platform === ""} onClick={() => setPlatform("")} />
          {PLATFORMS.map((p) => (
            <PlatformChip key={p.value} label={p.label} icon={p.icon} value={p.value} active={platform === p.value} onClick={() => setPlatform(p.value)} />
          ))}
        </div>
      </div>

      <div className="ds-table-wrap !rounded-none !border-0 mt-3">
        <table className="ds-table ds-table--compact">
          <thead>
            <tr>
              <th>Application</th>
              <th>Organization</th>
              <th>Owner</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Trust</th>
              <th>Verif.</th>
              <th>Class.</th>
              <th>MAU</th>
              <th>API 24h</th>
              <th>Fraud 24h</th>
              <th>Revenue</th>
              <th>Telecom</th>
              <th>SIM</th>
              <th>Last deploy</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={16} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={16} className="text-center py-16 text-[var(--ds-muted)]">No applications match.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/applications/${a.id}`} className="block group">
                    <div className="text-[12.5px] text-[var(--ds-ink)] font-medium group-hover:text-[var(--keyra-accent)] truncate max-w-[200px]">{a.name}</div>
                    <div className="text-[11px] text-[var(--ds-muted)] font-mono truncate max-w-[200px]">{a.slug}</div>
                  </Link>
                </td>
                <td>{a.organization_name ? <Link href={`/organizations/${a.organization_id}`} className="text-[var(--ds-body)] hover:text-[var(--keyra-accent)]">{a.organization_name}</Link> : <span className="text-[var(--ds-muted)]">—</span>}</td>
                <td className="text-[11.5px]">{a.developer_owner_name ?? "—"}</td>
                <td><PlatformBadge platform={a.platform} /></td>
                <td><StatusPill value={a.status} /></td>
                <td><StatusPill value={a.trust_status} /></td>
                <td><StatusPill value={a.verification_status} /></td>
                <td><Badge tone="muted">{a.data_classification}</Badge></td>
                <td className="font-mono tabular-nums">{formatNumber(Number(a.monthly_active_users), { compact: true })}</td>
                <td className="font-mono tabular-nums">{formatNumber(Number(a.daily_api_calls), { compact: true })}</td>
                <td>{a.fraud_events_24h > 0 ? <Badge tone="critical">{a.fraud_events_24h}</Badge> : <span className="font-mono tabular-nums text-[var(--ds-muted)]">0</span>}</td>
                <td className="font-mono tabular-nums">{formatCurrency(Number(a.revenue_generated_usd), "USD", { compact: true })}</td>
                <td>{a.telecom_verification_enabled ? <Badge tone="success" dot>ON</Badge> : <Badge tone="muted">OFF</Badge>}</td>
                <td>{a.sim_identity_enabled ? <Badge tone="success" dot>ON</Badge> : <Badge tone="muted">OFF</Badge>}</td>
                <td className="text-[11.5px] font-mono">{formatRelativeTime(a.last_deployment_at)}</td>
                <td>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button size="icon" variant="ghost"><MaterialIcon name="more_horiz" size={14} /></Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="ds-menu" sideOffset={6} align="end">
                        <DropdownMenu.Item className="ds-menu__item" onSelect={(e) => { e.preventDefault(); window.location.href = `/applications/${a.id}`; }}><MaterialIcon name="visibility" size={14}/> View profile</DropdownMenu.Item>
                        <DropdownMenu.Separator className="ds-menu__sep" />
                        <DropdownMenu.Item className="ds-menu__item" onSelect={() => onSuspend(a.id)} data-destructive="true"><MaterialIcon name="pause" size={14}/> Suspend</DropdownMenu.Item>
                        <DropdownMenu.Item className="ds-menu__item" onSelect={() => onRevoke(a.id)} data-destructive="true"><MaterialIcon name="vpn_key_off" size={14}/> Revoke all keys</DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ds-pagination">
        <div>Page <strong className="text-[var(--ds-ink)]">{page}</strong>/<strong className="text-[var(--ds-ink)]">{totalPages}</strong> · {formatNumber(total)} total</div>
        <div className="ds-pagination__actions">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><MaterialIcon name="chevron_left" size={14}/> Prev</Button>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <MaterialIcon name="chevron_right" size={14}/></Button>
        </div>
      </div>
    </Panel>
  );
}

function PlatformChip({ label, icon, value, active, onClick }: { label: string; icon?: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-value={value}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] border transition-colors ${
        active
          ? "bg-[rgba(var(--keyra-accent-rgb),0.18)] border-[rgba(var(--keyra-accent-rgb),0.45)] text-[var(--ds-ink)]"
          : "bg-[var(--ds-surface-card)] border-[var(--ds-hairline)] text-[var(--ds-muted)] hover:text-[var(--ds-ink)]"
      }`}
    >
      {icon ? <MaterialIcon name={icon} size={12} /> : null}
      <span>{label}</span>
    </button>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = PLATFORMS.find((x) => x.value === platform);
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--ds-body)]">
      {p?.icon ? <MaterialIcon name={p.icon} size={12} className="text-[var(--keyra-accent)]" /> : null}
      <span>{p?.label ?? platform}</span>
    </span>
  );
}
