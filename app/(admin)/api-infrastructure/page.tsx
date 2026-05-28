"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatPercent, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface Summary {
  requests_24h: number;
  active_projects: number;
  active_accounts: number;
  p95_ms: number;
  error_rate_pct: number | string;
  last_request_at: string | null;
}

interface EnvRow {
  region: string;
  nodes: number;
  online: number;
}

interface ProjectTrafficRow {
  id: string;
  name: string;
  region: string;
  node_type: string;
  status: string;
  rps: number;
  p95: number;
  error_rate: number | string | null;
  last_heartbeat_at: string | null;
  developer_name: string | null;
}

interface TimePoint {
  ts: string;
  rps: number;
  p95: number;
  error_rate: number | string;
}

function healthBadge(summary: Summary | undefined) {
  if (!summary || summary.requests_24h === 0) {
    return { tone: "muted" as const, label: "NO TRAFFIC" };
  }
  const err = Number(summary.error_rate_pct);
  if (err >= 10) return { tone: "critical" as const, label: "ELEVATED ERRORS" };
  if (err >= 2) return { tone: "warning" as const, label: "DEGRADED" };
  return { tone: "success" as const, label: "HEALTHY" };
}

export default function ApiInfrastructurePage() {
  const [chartHours, setChartHours] = React.useState<1 | 24>(24);

  const summary = useSWR<{ ok: true; data: Summary }>("/api-infrastructure/summary", swrFetcher, {
    refreshInterval: 30000,
  });
  const regions = useSWR<{ ok: true; items: EnvRow[] }>("/api-infrastructure/regions", swrFetcher, {
    refreshInterval: 30000,
  });
  const nodes = useSWR<{ ok: true; items: ProjectTrafficRow[] }>("/api-infrastructure/nodes", swrFetcher, {
    refreshInterval: 30000,
  });
  const series = useSWR<{ ok: true; items: TimePoint[] }>(
    `/api-infrastructure/timeseries?hours=${chartHours}`,
    swrFetcher,
    { refreshInterval: 30000 },
  );

  const s = summary.data?.data;
  const health = healthBadge(s);
  const points = (series.data?.items ?? []).map((p) => ({
    ts: new Date(p.ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      ...(chartHours > 1 ? { month: "short", day: "numeric" } : {}),
    }),
    requests: Number(p.rps),
    p95: Number(p.p95),
    error: Number(p.error_rate),
  }));
  const hasChart = points.length > 0;
  const projectRows = nodes.data?.items ?? [];
  const envRows = regions.data?.items ?? [];
  const loading = summary.isLoading || nodes.isLoading;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // API INFRASTRUCTURE</span>
            <Badge tone={health.tone} dot>
              {health.label}
            </Badge>
          </>
        }
        title="Global API traffic"
        subtitle="Telemetry from developer API key usage logs — requests, latency, and errors across environments and projects."
      />

      <div className="flex flex-col gap-4">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon="bolt"
            label="Requests (24h)"
            value={loading ? 0 : (s?.requests_24h ?? 0)}
            format="number"
            pulse={s?.requests_24h ? "success" : undefined}
          />
          <MetricCard
            icon="deployed_code"
            label="Active projects"
            value={loading ? 0 : (s?.active_projects ?? 0)}
            format="number"
          />
          <MetricCard
            icon="speed"
            label="p95 latency"
            value={loading || !s?.requests_24h ? 0 : s.p95_ms}
            format="raw"
            suffix=" ms"
          />
          <MetricCard
            icon="error"
            label="Error rate"
            value={loading || !s?.requests_24h ? 0 : Number(s.error_rate_pct)}
            format="percent"
            decimals={2}
            pulse={
              s?.requests_24h && Number(s.error_rate_pct) >= 5
                ? "error"
                : s?.requests_24h && Number(s.error_rate_pct) >= 1
                  ? "warning"
                  : s?.requests_24h
                    ? "success"
                    : undefined
            }
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
          <Panel
            title="Request volume"
            icon="monitoring"
            subtitle={`Requests per minute · p95 latency · ${chartHours === 1 ? "last hour" : "last 24 hours"}`}
            actions={
              <div className="flex items-center gap-2">
                {s?.last_request_at ? (
                  <span className="hidden sm:inline text-[11px] text-[var(--ds-muted)] mr-1">
                    Last {formatRelativeTime(s.last_request_at)}
                  </span>
                ) : null}
                <div className="flex rounded-md border border-[var(--ds-hairline-strong)] overflow-hidden">
                  <ChartRangeButton active={chartHours === 1} onClick={() => setChartHours(1)}>
                    1h
                  </ChartRangeButton>
                  <ChartRangeButton active={chartHours === 24} onClick={() => setChartHours(24)}>
                    24h
                  </ChartRangeButton>
                </div>
              </div>
            }
            bodyClassName="!pt-2"
          >
            {series.isLoading ? (
              <ChartPlaceholder message="Loading telemetry…" />
            ) : hasChart ? (
              <div className="w-full h-[280px] min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--ds-hairline)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="ts" stroke="var(--ds-muted)" tick={{ fontSize: 10 }} minTickGap={32} />
                    <YAxis
                      yAxisId="req"
                      stroke="var(--ds-muted)"
                      tick={{ fontSize: 10 }}
                      allowDecimals={false}
                      width={44}
                    />
                    <YAxis
                      yAxisId="lat"
                      orientation="right"
                      stroke="var(--ds-muted)"
                      tick={{ fontSize: 10 }}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--ds-surface-card)",
                        border: "1px solid var(--ds-hairline-strong)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      yAxisId="req"
                      type="monotone"
                      dataKey="requests"
                      stroke="var(--keyra-accent)"
                      strokeWidth={2}
                      dot={false}
                      name="Requests/min"
                    />
                    <Line
                      yAxisId="lat"
                      type="monotone"
                      dataKey="p95"
                      stroke="var(--ds-warning)"
                      strokeWidth={1.5}
                      dot={false}
                      name="p95 ms"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartPlaceholder
                icon="insights"
                message={`No API requests in the last ${chartHours === 1 ? "hour" : "24 hours"}`}
                detail="Make authenticated API calls with an active developer key to populate this chart."
              />
            )}
          </Panel>

          <div className="flex flex-col gap-4 min-w-0">
            <Panel title="By environment" icon="layers" subtitle="24h request mix">
              {envRows.length === 0 ? (
                <p className="text-[12px] text-[var(--ds-muted)] py-2">No traffic recorded yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {envRows.map((r) => {
                    const total = s?.requests_24h || 0;
                    const share = total > 0 ? (r.nodes / total) * 100 : 0;
                    return (
                      <li
                        key={r.region}
                        className="rounded-md border border-[var(--ds-hairline)] bg-[var(--ds-surface-strong)] px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Badge tone={r.region === "production" ? "accent" : "muted"}>
                            {r.region.toUpperCase()}
                          </Badge>
                          <span className="text-[11px] text-[var(--ds-muted)] tabular-nums">
                            {formatPercent(share, 0)} of traffic
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[20px] font-semibold font-mono tabular-nums text-[var(--ds-ink)]">
                            {formatNumber(r.nodes)}
                          </span>
                          <span className="text-[11px] text-[var(--ds-success)] tabular-nums">
                            {formatNumber(r.online)} OK ·{" "}
                            {r.nodes > 0 ? formatPercent((r.online / r.nodes) * 100, 1) : "—"}
                          </span>
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-[var(--ds-hairline)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--keyra-accent)]"
                            style={{ width: `${Math.min(100, share)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="Accounts" icon="groups" subtitle="Last 24 hours">
              <dl className="grid grid-cols-[1fr_auto] gap-y-2.5 gap-x-3 text-[12.5px]">
                <dt className="text-[var(--ds-muted)]">Developer accounts</dt>
                <dd className="font-mono tabular-nums text-[var(--ds-ink)] text-right">
                  {loading ? "…" : formatNumber(s?.active_accounts ?? 0)}
                </dd>
                <dt className="text-[var(--ds-muted)]">Projects with traffic</dt>
                <dd className="font-mono tabular-nums text-[var(--ds-ink)] text-right">
                  {loading ? "…" : formatNumber(s?.active_projects ?? 0)}
                </dd>
                <dt className="text-[var(--ds-muted)]">Last request</dt>
                <dd className="text-[var(--ds-ink)] text-right whitespace-nowrap">
                  {s?.last_request_at ? formatRelativeTime(s.last_request_at) : "—"}
                </dd>
              </dl>
            </Panel>
          </div>
        </div>

        <Panel
          title="Traffic by project"
          icon="deployed_code"
          subtitle={
            loading
              ? "Loading…"
              : projectRows.length
                ? `${projectRows.length} project${projectRows.length === 1 ? "" : "s"} · last 24h`
                : "No project traffic in the last 24h"
          }
          bodyClassName="!p-0"
          flush
        >
          <div className="ds-table-wrap is-scrollable !rounded-none !border-0">
            <table className="ds-table ds-table--compact">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Developer</th>
                  <th>Environment</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th className="text-right">Requests</th>
                  <th className="text-right">p95</th>
                  <th className="text-right">Error</th>
                  <th>Last request</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-[var(--ds-muted)]">
                      <MaterialIcon name="hourglass" size={16} className="inline mr-1 align-[-2px]" />
                      Loading…
                    </td>
                  </tr>
                ) : projectRows.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyTable
                        message="No usage logged yet"
                        detail="Traffic appears when developers call KEYRA APIs with active keys."
                      />
                    </td>
                  </tr>
                ) : (
                  projectRows.map((n) => (
                    <tr key={n.id}>
                      <td className="min-w-[140px]">
                        <Link
                          href={`/applications/${n.id}`}
                          className="font-medium text-[12.5px] text-[var(--keyra-accent)] hover:underline"
                        >
                          {n.name}
                        </Link>
                      </td>
                      <td className="text-[12px] text-[var(--ds-muted)] max-w-[160px] truncate">
                        {n.developer_name ?? "—"}
                      </td>
                      <td>
                        <Badge tone={n.region === "production" ? "accent" : "muted"}>{n.region}</Badge>
                      </td>
                      <td>
                        <Badge tone="muted">{n.node_type}</Badge>
                      </td>
                      <td>
                        <StatusPill value={n.status} />
                      </td>
                      <td className="font-mono tabular-nums text-right">{formatNumber(n.rps ?? 0)}</td>
                      <td className="font-mono tabular-nums text-right">{n.p95 ? `${n.p95} ms` : "—"}</td>
                      <td className="font-mono tabular-nums text-right">
                        {formatPercent(Number(n.error_rate ?? 0), 2)}
                      </td>
                      <td className="text-[11.5px] text-[var(--ds-muted)] whitespace-nowrap">
                        {formatRelativeTime(n.last_heartbeat_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

function ChartRangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-2.5 py-1 text-[11px] font-medium bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
          : "px-2.5 py-1 text-[11px] font-medium text-[var(--ds-muted)] hover:text-[var(--ds-ink)] hover:bg-[var(--ds-surface-strong)]"
      }
    >
      {children}
    </button>
  );
}

function ChartPlaceholder({
  icon = "hourglass_empty",
  message,
  detail,
}: {
  icon?: string;
  message: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] py-8 px-6 text-center border border-dashed border-[var(--ds-hairline)] rounded-lg mx-1 mb-1 bg-[var(--ds-surface-strong)]/40">
      <MaterialIcon name={icon} size={28} className="text-[var(--ds-muted)] opacity-50" />
      <p className="mt-3 text-[13.5px] text-[var(--ds-ink)]">{message}</p>
      {detail ? <p className="mt-1 max-w-sm text-[12px] text-[var(--ds-muted)] leading-relaxed">{detail}</p> : null}
    </div>
  );
}

function EmptyTable({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <MaterialIcon name="inbox" size={24} className="text-[var(--ds-muted)] opacity-40" />
      <p className="mt-2 text-[13px] text-[var(--ds-ink)]">{message}</p>
      <p className="mt-1 max-w-md text-[12px] text-[var(--ds-muted)]">{detail}</p>
    </div>
  );
}
