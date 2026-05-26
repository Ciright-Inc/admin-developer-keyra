"use client";

import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatPercent, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface RegionRow { region: string; nodes: number; online: number }
interface NodeRow { id: string; name: string; region: string; country_iso2: string | null; node_type: string; status: string; rps: number | null; p95: number | null; error_rate: number | string | null; last_heartbeat_at: string | null; }
interface TimePoint { ts: string; rps: number; p95: number; error_rate: number | string }

export default function ApiInfrastructurePage() {
  const regions = useSWR<{ ok: true; items: RegionRow[] }>("/api-infrastructure/regions", swrFetcher);
  const nodes = useSWR<{ ok: true; items: NodeRow[] }>("/api-infrastructure/nodes", swrFetcher);
  const series = useSWR<{ ok: true; items: TimePoint[] }>("/api-infrastructure/timeseries", swrFetcher, { refreshInterval: 30000 });

  const points = (series.data?.items ?? []).map((p) => ({
    ts: new Date(p.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    rps: Number(p.rps),
    p95: Number(p.p95),
    error: Number(p.error_rate),
  }));

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // API INFRASTRUCTURE</span>
            <Badge tone="success" dot>NOMINAL</Badge>
          </>
        }
        title="Global API infrastructure"
        subtitle="Edge, core and telecom relay nodes — live RPS, p95 latency and error-rate telemetry across every KEYRA region."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {(regions.data?.items ?? []).map((r) => (
          <Panel key={r.region} title={r.region} icon="travel_explore">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[26px] font-semibold text-[var(--ds-ink)] font-mono">{r.online}/{r.nodes}</div>
                <div className="text-[11.5px] text-[var(--ds-muted)]">nodes online</div>
              </div>
              <Badge tone={r.online === r.nodes ? "success" : r.online === 0 ? "critical" : "warning"} dot>
                {r.nodes ? formatPercent((r.online / r.nodes) * 100, 0) : "—"}
              </Badge>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Last-hour telemetry" icon="bolt" subtitle="RPS / p95 latency / error-rate">
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--ds-hairline)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="ts" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="rps" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="lat" orientation="right" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--ds-surface-card)", border: "1px solid var(--ds-hairline-strong)", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="rps" type="monotone" dataKey="rps" stroke="var(--keyra-accent)" strokeWidth={2} dot={false} name="RPS" />
              <Line yAxisId="lat" type="monotone" dataKey="p95" stroke="var(--ds-warning)" strokeWidth={1.5} dot={false} name="p95 ms" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Infrastructure nodes" icon="device_hub" subtitle={`${(nodes.data?.items ?? []).length} nodes worldwide`} bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead>
              <tr>
                <th>Node</th><th>Region</th><th>Type</th><th>Status</th><th>RPS</th><th>p95</th><th>Error</th><th>Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              {(nodes.data?.items ?? []).map((n) => (
                <tr key={n.id}>
                  <td className="font-mono text-[12px]">{n.name}</td>
                  <td>{n.region}</td>
                  <td><Badge tone="muted">{n.node_type}</Badge></td>
                  <td><StatusPill value={n.status} /></td>
                  <td className="font-mono tabular-nums">{formatNumber(n.rps ?? 0, { compact: true })}</td>
                  <td className="font-mono tabular-nums">{n.p95 ?? "—"}ms</td>
                  <td className="font-mono tabular-nums">{formatPercent(Number(n.error_rate ?? 0), 2)}</td>
                  <td className="text-[11.5px]"><MaterialIcon name="favorite" size={12} className="text-[var(--ds-success)] mr-1" />{formatRelativeTime(n.last_heartbeat_at)}</td>
                </tr>
              ))}
              {!nodes.data && (
                <tr><td colSpan={8} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
