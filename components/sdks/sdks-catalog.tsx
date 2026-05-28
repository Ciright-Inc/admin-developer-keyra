"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { frameworkIcon, frameworkLabel, isKnownFramework } from "@/lib/project-frameworks";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

export interface SdkAdoptionRow {
  id: string;
  slug: string;
  name: string;
  platform: string;
  install_count: number;
  developer_count?: number;
  production_count?: number;
  active_count?: number;
  last_adoption_at: string | null;
  latest_version?: string;
  deprecated_at?: string | null;
}

interface SdkSummary {
  total_projects: number;
  frameworks_in_use: number;
  developer_accounts: number;
  unspecified_projects: number;
  production_projects: number;
  last_project_update: string | null;
}

interface ProjectInstallRow {
  id: string;
  application_name: string;
  slug: string;
  environment: string;
  status: string;
  developer_name: string | null;
  organization_name: string | null;
  installed_at: string;
  updated_at: string;
}

export function SdksAdoption() {
  const [frameworkFilter, setFrameworkFilter] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const summary = useSWR<{ ok: true; data: SdkSummary }>("/sdks/adoption/summary", swrFetcher, {
    refreshInterval: 60000,
  });
  const list = useSWR<{ ok: true; items: SdkAdoptionRow[] }>("/sdks/adoption/frameworks", swrFetcher, {
    refreshInterval: 60000,
  });

  const s = summary.data?.data;
  const rows = list.data?.items ?? [];
  const filtered = frameworkFilter
    ? rows.filter((r) => r.slug === frameworkFilter)
    : rows;
  const loading = summary.isLoading || list.isLoading;
  const hasData = rows.length > 0;

  const installs = useSWR<{ ok: true; items: ProjectInstallRow[] }>(
    expanded ? `/sdks/adoption/projects?framework=${encodeURIComponent(expanded)}` : null,
    swrFetcher,
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon="package_2"
          label="Frameworks in use"
          value={loading ? 0 : (s?.frameworks_in_use ?? 0)}
          format="number"
        />
        <MetricCard
          icon="deployed_code"
          label="Total projects"
          value={loading ? 0 : (s?.total_projects ?? 0)}
          format="number"
          pulse={s?.total_projects ? "success" : undefined}
        />
        <MetricCard
          icon="groups"
          label="Developer accounts"
          value={loading ? 0 : (s?.developer_accounts ?? 0)}
          format="number"
        />
        <MetricCard
          icon="rocket_launch"
          label="Production projects"
          value={loading ? 0 : (s?.production_projects ?? 0)}
          format="number"
        />
      </section>

      <Panel
        title="Project framework adoption"
        icon="layers"
        subtitle={
          loading
            ? "Loading…"
            : hasData
              ? `${rows.length} framework${rows.length === 1 ? "" : "s"} — client stack at project creation, not npm installs`
              : "No projects registered yet"
        }
        bodyClassName="!p-0"
        flush
        actions={
          <div className="flex items-center gap-2">
            {hasData ? (
              <select
                className="ds-select"
                value={frameworkFilter}
                onChange={(e) => {
                  setFrameworkFilter(e.target.value);
                  setExpanded(null);
                }}
                aria-label="Filter by framework"
              >
                <option value="">All frameworks</option>
                {rows.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {frameworkLabel(r.slug)} ({r.install_count})
                  </option>
                ))}
              </select>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => void list.mutate()}>
              <MaterialIcon name="refresh" size={13} /> Refresh
            </Button>
          </div>
        }
      >
        <div className="px-4 pt-4 pb-3 border-b border-[var(--ds-hairline)]">
          <p className="text-[12px] text-[var(--ds-muted)] leading-relaxed max-w-3xl">
            Adoption is measured by each project&apos;s selected client framework in the developer portal.
            Package install telemetry is not stored separately in this database.
          </p>
        </div>

        {!loading && !hasData ? (
          <EmptyState />
        ) : (
          <div className="ds-table-wrap is-scrollable !rounded-none !border-0">
            <table className="ds-table ds-table--compact">
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Status</th>
                  <th className="text-right">Projects</th>
                  <th className="text-right">Developers</th>
                  <th className="text-right">Production</th>
                  <th>Last activity</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[var(--ds-muted)]">
                      <MaterialIcon name="hourglass" size={16} className="inline mr-1 align-[-2px]" />
                      Loading…
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const isOpen = expanded === row.slug;
                    const known = isKnownFramework(row.slug);
                    return (
                      <React.Fragment key={row.slug}>
                        <tr className={isOpen ? "bg-[var(--ds-surface-strong)]/50" : undefined}>
                          <td>
                            <div className="flex items-center gap-2.5 min-w-[160px]">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--ds-hairline)] bg-[var(--ds-surface-strong)]">
                                <MaterialIcon name={frameworkIcon(row.slug)} size={18} className="text-[var(--ds-muted)]" />
                              </span>
                              <div>
                                <div className="text-[13px] font-medium text-[var(--ds-ink)]">
                                  {frameworkLabel(row.slug)}
                                </div>
                                <div className="text-[10.5px] font-mono text-[var(--ds-muted)]">{row.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {known ? (
                              <Badge tone="success" dot>
                                ACTIVE
                              </Badge>
                            ) : row.slug === "unspecified" ? (
                              <Badge tone="warning">NEEDS FRAMEWORK</Badge>
                            ) : (
                              <Badge tone="muted">CUSTOM</Badge>
                            )}
                          </td>
                          <td className="font-mono tabular-nums text-right text-[13px]">
                            {formatNumber(row.install_count)}
                          </td>
                          <td className="font-mono tabular-nums text-right text-[13px] text-[var(--ds-muted)]">
                            {formatNumber(row.developer_count ?? 0)}
                          </td>
                          <td className="font-mono tabular-nums text-right text-[13px]">
                            {formatNumber(row.production_count ?? 0)}
                          </td>
                          <td className="text-[11.5px] text-[var(--ds-muted)] whitespace-nowrap">
                            {row.last_adoption_at ? formatRelativeTime(row.last_adoption_at) : "—"}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpanded(isOpen ? null : row.slug)}
                                aria-expanded={isOpen}
                              >
                                <MaterialIcon name={isOpen ? "expand_less" : "expand_more"} size={14} />
                                Projects
                              </Button>
                              <Link
                                href={`/applications?platform=${encodeURIComponent(row.slug)}`}
                                className="ds-btn ds-btn--ghost ds-btn--sm inline-flex items-center gap-1"
                              >
                                <MaterialIcon name="open_in_new" size={13} />
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {isOpen ? (
                          <tr>
                            <td colSpan={7} className="!p-0 bg-[var(--ds-surface-strong)]/30">
                              <ProjectsSubTable
                                framework={row.slug}
                                items={installs.data?.items}
                                loading={installs.isLoading}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function ProjectsSubTable({
  framework,
  items,
  loading,
}: {
  framework: string;
  items?: ProjectInstallRow[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--ds-muted)]">
        Loading projects for {frameworkLabel(framework)}…
      </div>
    );
  }
  if (!items?.length) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--ds-muted)]">No projects for this framework.</div>
    );
  }
  return (
    <div className="px-4 py-3">
      <table className="ds-table ds-table--compact w-full">
        <thead>
          <tr>
            <th>Project</th>
            <th>Developer</th>
            <th>Organization</th>
            <th>Environment</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/applications/${p.id}`} className="text-[12px] text-[var(--keyra-accent)] hover:underline">
                  {p.application_name}
                </Link>
                <div className="font-mono text-[10px] text-[var(--ds-muted)]">{p.slug}</div>
              </td>
              <td className="text-[12px]">{p.developer_name ?? "—"}</td>
              <td className="text-[12px] text-[var(--ds-muted)] truncate max-w-[140px]">
                {p.organization_name || "—"}
              </td>
              <td>
                <Badge tone={p.environment === "production" ? "accent" : "muted"}>{p.environment}</Badge>
              </td>
              <td>
                <StatusPill value={p.status} />
              </td>
              <td className="text-[11px] text-[var(--ds-muted)] whitespace-nowrap">
                {formatRelativeTime(p.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <MaterialIcon name="inventory_2" size={36} className="text-[var(--ds-muted)] opacity-40" />
      <p className="mt-4 text-[14px] text-[var(--ds-ink)]">No SDK adoption data yet</p>
      <p className="mt-2 max-w-md text-[12px] text-[var(--ds-muted)] leading-relaxed">
        When developers create projects and pick a client framework (React, iOS, Android, etc.) in the developer
        portal, adoption will appear here automatically.
      </p>
      <Link href="/applications" className="mt-4 ds-btn ds-btn--accent inline-flex items-center gap-1.5 text-[12px]">
        <MaterialIcon name="folder_special" size={14} />
        View projects
      </Link>
    </div>
  );
}
