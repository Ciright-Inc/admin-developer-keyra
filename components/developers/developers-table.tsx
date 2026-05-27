"use client";

import * as React from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { DeveloperRowActions } from "@/components/developers/developer-row-actions";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  initialsOf,
  shortHash,
  trustScoreColor,
} from "@/lib/utils";
import { adminUrl } from "@/lib/admin-backend-url";
import { swrFetcher } from "@/lib/admin-fetch";
import type { Developer, ListResponse } from "@/types/admin";

const COUNTRY_OPTIONS = ["US","GB","IE","DE","FR","NL","ES","IT","SE","NO","CH","CA","BR","MX","AE","SA","IL","IN","SG","JP","KR","AU","NZ","ZA","NG"];
const INDUSTRY_OPTIONS = ["banking","telecom","government","healthcare","education","ai_infrastructure","ai_agents","autonomous_vehicles","robotics","aviation","energy","manufacturing","smart_cities","security","defense","media","gaming","metaverse","logistics","retail"];
const STATUS_OPTIONS = ["active","suspended","dormant","banned"];
const LIFECYCLE_OPTIONS = ["onboarded","activated","growing","scaling","enterprise","dormant","churned"];

export function DevelopersTable() {
  const [search, setSearch] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [lifecycle, setLifecycle] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState("last_activity_at:desc");
  const limit = 25;

  const filterKey = `${search}|${country}|${industry}|${status}|${lifecycle}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (country) qs.set("country", country);
  if (industry) qs.set("industry", industry);
  if (status) qs.set("status", status);
  if (lifecycle) qs.set("lifecycle", lifecycle);
  if (sort) qs.set("sort", sort);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const path = `/developers?${qs.toString()}`;
  const { data, isLoading, mutate } = useSWR<ListResponse<Developer>>(path, swrFetcher, {
    revalidateOnFocus: false,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns = React.useMemo<ColumnDef<Developer>[]>(() => makeColumns(() => mutate()), [mutate]);
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  const toggleSort = (column: string) => {
    setSort((prev) => {
      const [c, dir] = prev.split(":");
      if (c === column) return `${column}:${dir === "asc" ? "desc" : "asc"}`;
      return `${column}:desc`;
    });
  };

  return (
    <Panel
      title="Global developers"
      icon="groups"
      subtitle={`${formatNumber(total)} accounts`}
      bodyClassName="!p-0"
      flush
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => void mutate()}>
            <MaterialIcon name="refresh" size={13} /> Refresh
          </Button>
          <Button variant="accent" size="sm">
            <MaterialIcon name="file_download" size={13} /> Export CSV
          </Button>
        </div>
      }
    >
      <div className="px-4 pt-4">
        <FilterBar
          search={search}
          onSearch={setSearch}
          country={country}
          onCountry={setCountry}
          industry={industry}
          onIndustry={setIndustry}
          status={status}
          onStatus={setStatus}
          lifecycle={lifecycle}
          onLifecycle={setLifecycle}
          onReset={() => {
            setSearch(""); setCountry(""); setIndustry(""); setStatus(""); setLifecycle("");
          }}
        />
      </div>
      <div className="ds-table-wrap is-scrollable mt-4">
        <table className="ds-table ds-table--compact">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = (h.column.columnDef.meta as { sortKey?: string } | undefined)?.sortKey;
                  return (
                    <th
                      key={h.id}
                      style={{ width: h.getSize() ? `${h.getSize()}px` : undefined }}
                      data-sortable={sortable ? "true" : undefined}
                      onClick={() => sortable && toggleSort(sortable)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sortable && sort.startsWith(`${sortable}:`) ? (
                          <MaterialIcon
                            name={sort.endsWith(":asc") ? "arrow_drop_up" : "arrow_drop_down"}
                            size={14}
                          />
                        ) : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-[var(--ds-muted)]">
                  <MaterialIcon name="hourglass" size={14} /> Loading developers…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-[var(--ds-muted)]">
                  <div className="flex flex-col items-center gap-2">
                    <MaterialIcon name="search_off" size={20} />
                    <div>No developers match the current filters.</div>
                    <div className="text-[11px]">Try clearing filters or seed the database: <code className="text-[var(--keyra-accent)]">npm run seed:keyra-admin</code></div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="ds-pagination">
        <div>
          Page <strong className="text-[var(--ds-ink)]">{page}</strong> of <strong className="text-[var(--ds-ink)]">{totalPages}</strong>
          {" · "}
          <span className="font-mono tabular-nums">{formatNumber(total)} total</span>
        </div>
        <div className="ds-pagination__actions">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <MaterialIcon name="chevron_left" size={14} /> Prev
          </Button>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next <MaterialIcon name="chevron_right" size={14} />
          </Button>
        </div>
      </div>
      <input type="hidden" data-debug-url={adminUrl(path)} />
    </Panel>
  );
}

function FilterBar(props: {
  search: string; onSearch: (v: string) => void;
  country: string; onCountry: (v: string) => void;
  industry: string; onIndustry: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  lifecycle: string; onLifecycle: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="ds-filter-bar">
      <div className="relative flex-1 min-w-[240px]">
        <MaterialIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]" />
        <input
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="ds-input ds-input--icon"
        />
      </div>
      <div className="w-[170px] min-w-[170px]">
        <select className="ds-select" value={props.country} onChange={(e) => props.onCountry(e.target.value)}>
          <option value="">Country (all)</option>
          {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="w-[190px] min-w-[190px]">
        <select className="ds-select" value={props.industry} onChange={(e) => props.onIndustry(e.target.value)}>
          <option value="">Industry (all)</option>
          {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div className="w-[160px] min-w-[160px]">
        <select className="ds-select" value={props.status} onChange={(e) => props.onStatus(e.target.value)}>
          <option value="">Status (all)</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="w-[170px] min-w-[170px]">
        <select className="ds-select" value={props.lifecycle} onChange={(e) => props.onLifecycle(e.target.value)}>
          <option value="">Lifecycle (all)</option>
          {LIFECYCLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Button variant="ghost" size="sm" onClick={props.onReset}>
        <MaterialIcon name="restart_alt" size={13}/> Reset
      </Button>
    </div>
  );
}

function makeColumns(onChanged: () => void): ColumnDef<Developer>[] {
  return [
    {
      id: "dev",
      header: "Developer",
      size: 280,
      cell: ({ row }) => {
        const d = row.original;
        return (
          <Link href={`/developers/${d.id}`} className="flex items-center gap-2.5 group">
            <span className="ds-avatar !w-8 !h-8 !rounded-md !text-[11px]">{initialsOf(d.display_name || d.professional_email)}</span>
            <span className="min-w-0">
              <span className="block text-[12.5px] text-[var(--ds-ink)] font-medium truncate group-hover:text-[var(--keyra-accent)]">{d.display_name || "—"}</span>
              <span className="block text-[11px] text-[var(--ds-muted)] truncate">@{d.username ?? "—"} · {d.professional_email}</span>
            </span>
          </Link>
        );
      },
    },
    { id: "subscription_hash", header: "Sub hash", cell: ({ row }) => <span className="font-mono text-[11px] text-[var(--ds-muted)]">{shortHash(row.original.subscription_hash, 10)}</span> },
    { id: "created_at", header: "Created", meta: { sortKey: "created_at" }, cell: ({ row }) => <span className="text-[11.5px] text-[var(--ds-body)]">{formatDate(row.original.created_at)}</span> },
    { id: "last_activity", header: "Last activity", meta: { sortKey: "last_activity_at" }, cell: ({ row }) => <span className="text-[11.5px]">{formatRelativeTime(row.original.last_activity_at)}</span> },
    { id: "phone", header: "Mobile", cell: ({ row }) => <span className="font-mono text-[11px]">{row.original.mobile_phone || "—"}</span> },
    { id: "country", header: "Country", cell: ({ row }) => <Badge tone="muted">{row.original.country_iso2 ?? "—"}</Badge> },
    { id: "region", header: "Region", cell: ({ row }) => <span className="text-[11.5px]">{row.original.region || "—"}</span> },
    { id: "city", header: "City", cell: ({ row }) => <span className="text-[11.5px]">{row.original.city || "—"}</span> },
    { id: "org_count", header: "Orgs", cell: ({ row }) => <span className="font-mono tabular-nums">{formatNumber(row.original.organization_count)}</span> },
    { id: "team_size", header: "Team", cell: ({ row }) => <span className="font-mono tabular-nums">{formatNumber(row.original.team_size)}</span> },
    { id: "app_count", header: "Apps", cell: ({ row }) => <span className="font-mono tabular-nums">{formatNumber(row.original.application_count)}</span> },
    { id: "sdk_count", header: "SDKs", cell: () => <span className="font-mono tabular-nums text-[var(--ds-muted)]">—</span> },
    { id: "api_calls_24h", header: "API 24h", meta: { sortKey: "api_calls_24h" }, cell: ({ row }) => <span className="font-mono tabular-nums">{formatNumber(Number(row.original.api_calls_24h ?? 0), { compact: true })}</span> },
    { id: "trust", header: "Trust", meta: { sortKey: "trust_score" }, cell: ({ row }) => <TrustChip value={Number(row.original.trust_score ?? 0)} /> },
    { id: "verification", header: "Verification", cell: ({ row }) => <StatusPill value={row.original.verification_status} /> },
    { id: "industry", header: "Industry", cell: ({ row }) => <Badge tone="muted">{row.original.industry_slug?.replace(/_/g, " ") ?? "—"}</Badge> },
    { id: "revenue", header: "Revenue", meta: { sortKey: "revenue_contribution_usd" }, cell: ({ row }) => <span className="font-mono tabular-nums">{formatCurrency(Number(row.original.revenue_contribution_usd ?? 0), "USD", { compact: true })}</span> },
    { id: "fraud", header: "Fraud", meta: { sortKey: "fraud_risk_score" }, cell: ({ row }) => <FraudChip value={Number(row.original.fraud_risk_score ?? 0)} /> },
    { id: "ai", header: "AI usage", cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.ai_usage_index ?? 0}</span> },
    { id: "telecom", header: "Telecom ID", cell: ({ row }) => <StatusPill value={row.original.telecom_identity_status} /> },
    { id: "human_verify", header: "Human verif.", cell: ({ row }) => <StatusPill value={row.original.human_verification_status} /> },
    { id: "kyc", header: "KYC", cell: ({ row }) => <StatusPill value={row.original.kyc_status} /> },
    { id: "compliance", header: "Compliance", cell: ({ row }) => <StatusPill value={row.original.compliance_status} /> },
    { id: "tier", header: "Tier", cell: ({ row }) => <Badge tone={row.original.enterprise_tier === "enterprise" ? "accent" : "muted"}>{row.original.enterprise_tier ?? "—"}</Badge> },
    { id: "lifecycle", header: "Lifecycle", cell: ({ row }) => <StatusPill value={row.original.lifecycle_stage} /> },
    { id: "actions", header: "", size: 48, cell: ({ row }) => <DeveloperRowActions developer={row.original} onChanged={onChanged} /> },
  ];
}

function TrustChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[11.5px]">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trustScoreColor(value) }} />
      <span className="text-[var(--ds-ink)] font-medium">{value || "—"}</span>
    </span>
  );
}
function FraudChip({ value }: { value: number }) {
  const tone = value > 70 ? "critical" : value > 40 ? "warning" : "success";
  return <Badge tone={tone}>{value}</Badge>;
}
