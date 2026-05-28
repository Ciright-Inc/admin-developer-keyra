"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency, formatNumber, formatPercent, initialsOf } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { ListResponse, Organization } from "@/types/admin";

const COUNTRY_OPTIONS = ["US","GB","IE","DE","FR","NL","ES","IT","SE","NO","CH","CA","BR","MX","AE","SA","IL","IN","SG","JP","KR","AU","NZ","ZA","NG"];
const INDUSTRY_OPTIONS = ["banking","telecom","government","healthcare","education","ai_infrastructure","ai_agents","autonomous_vehicles","robotics","aviation","energy","manufacturing","smart_cities","security","defense","media","gaming","metaverse","logistics","retail"];
const TIER_OPTIONS = ["startup","growth","business","enterprise","strategic","sovereign"];

export function OrganizationsTable() {
  const [search, setSearch] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [tier, setTier] = React.useState("");
  const [page, setPage] = React.useState(1);
  const filterKey = `${search}|${country}|${industry}|${tier}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  const limit = 25;
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (country) qs.set("country", country);
  if (industry) qs.set("industry", industry);
  if (tier) qs.set("tier", tier);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const { data, isLoading, mutate } = useSWR<ListResponse<Organization>>(
    `/organizations?${qs}`,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Panel
      title="Global organizations"
      icon="domain"
      subtitle={`${formatNumber(total)} registered`}
      bodyClassName="!p-0"
      flush
      actions={
        <Button variant="ghost" size="sm" onClick={() => void mutate()}>
          <MaterialIcon name="refresh" size={13} /> Refresh
        </Button>
      }
    >
      <div className="px-4 pt-4">
        <OrganizationsFilterBar
          search={search}
          onSearch={setSearch}
          country={country}
          onCountry={setCountry}
          industry={industry}
          onIndustry={setIndustry}
          tier={tier}
          onTier={setTier}
          onReset={() => {
            setSearch("");
            setCountry("");
            setIndustry("");
            setTier("");
          }}
        />
      </div>
      <div className="ds-table-wrap is-scrollable mt-4">
        <table className="ds-table ds-table--compact">
          <thead>
            <tr>
              <th className="ds-table__col-sticky">Organization</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Tier</th>
              <th>Devs</th>
              <th>Projects</th>
              <th>API util</th>
              <th>AI agents</th>
              <th>Verif.</th>
              <th>Security</th>
              <th>Risk</th>
              <th>Compliance</th>
              <th>Telecom</th>
              <th>MRR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={15} className="text-center py-12 text-[var(--ds-muted)]">
                  <MaterialIcon name="hourglass" size={14} /> Loading organizations…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-center py-16 text-[var(--ds-muted)]">
                  <div className="flex flex-col items-center gap-2">
                    <MaterialIcon name="search_off" size={20} />
                    <div>No organizations match the current filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td className="ds-table__col-sticky">
                    <Link href={`/organizations/${o.id}`} className="flex items-center gap-2.5 group min-w-[200px]">
                      <span className="ds-avatar !w-8 !h-8 !rounded-md !text-[10.5px] shrink-0">
                        {initialsOf(o.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] text-[var(--ds-ink)] font-medium truncate group-hover:text-[var(--keyra-accent)]">
                          {o.name}
                        </span>
                        <span className="block text-[11px] text-[var(--ds-muted)] truncate font-mono">{o.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Badge tone="muted">{o.industry_slug?.replace(/_/g, " ") ?? "—"}</Badge>
                  </td>
                  <td>
                    <Badge tone="muted">{o.country_iso2 ?? o.region ?? "—"}</Badge>
                  </td>
                  <td>
                    <Badge tone={o.enterprise_tier === "enterprise" || o.enterprise_tier === "sovereign" ? "accent" : "muted"}>
                      {o.enterprise_tier?.toUpperCase() ?? "—"}
                    </Badge>
                  </td>
                  <td className="font-mono tabular-nums">{formatNumber(o.developer_count)}</td>
                  <td className="font-mono tabular-nums">{formatNumber(o.application_count)}</td>
                  <td className="font-mono tabular-nums">{formatPercent(Number(o.api_utilization_pct), 1)}</td>
                  <td className="font-mono tabular-nums">{formatNumber(o.ai_agent_count)}</td>
                  <td>
                    <span className="font-mono tabular-nums">{o.verification_rating}</span>
                  </td>
                  <td>
                    <Badge tone={o.security_score > 80 ? "success" : o.security_score > 50 ? "warning" : "critical"}>
                      {o.security_score}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={o.operational_risk_score > 60 ? "critical" : o.operational_risk_score > 30 ? "warning" : "success"}>
                      {o.operational_risk_score}
                    </Badge>
                  </td>
                  <td>
                    <StatusPill value={o.compliance_level} />
                  </td>
                  <td>
                    <StatusPill value={o.telecom_integration_status} />
                  </td>
                  <td className="font-mono tabular-nums text-[var(--ds-ink)] whitespace-nowrap">
                    {formatCurrency(Number(o.monthly_recurring_revenue_usd), "USD", { compact: true })}
                  </td>
                  <td>
                    <StatusPill value={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="ds-pagination">
        <div>
          Page <strong className="text-[var(--ds-ink)]">{page}</strong> of{" "}
          <strong className="text-[var(--ds-ink)]">{totalPages}</strong>
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
    </Panel>
  );
}

function OrganizationsFilterBar(props: {
  search: string;
  onSearch: (v: string) => void;
  country: string;
  onCountry: (v: string) => void;
  industry: string;
  onIndustry: (v: string) => void;
  tier: string;
  onTier: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="ds-filter-bar">
      <div className="relative flex-1 min-w-[240px]">
        <MaterialIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]" />
        <input
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search organizations…"
          className="ds-input ds-input--icon"
        />
      </div>
      <div className="w-[170px] min-w-[170px]">
        <select className="ds-select" value={props.country} onChange={(e) => props.onCountry(e.target.value)}>
          <option value="">Country (all)</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[190px] min-w-[190px]">
        <select className="ds-select" value={props.industry} onChange={(e) => props.onIndustry(e.target.value)}>
          <option value="">Industry (all)</option>
          {INDUSTRY_OPTIONS.map((i) => (
            <option key={i} value={i}>
              {i.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[170px] min-w-[170px]">
        <select className="ds-select" value={props.tier} onChange={(e) => props.onTier(e.target.value)}>
          <option value="">Tier (all)</option>
          {TIER_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <Button variant="ghost" size="sm" onClick={props.onReset}>
        <MaterialIcon name="restart_alt" size={13} /> Reset
      </Button>
    </div>
  );
}
