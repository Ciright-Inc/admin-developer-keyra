"use client";

import useSWR from "swr";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface Summary { mrr: number; today: number }
interface ByGroup { country_iso2?: string; industry_slug?: string; enterprise_tier?: string; mrr: number | string; organizations: number }

export default function RevenuePage() {
  const summary = useSWR<{ ok: true; data: Summary }>("/revenue/summary", swrFetcher, { refreshInterval: 30000 });
  const byCountry = useSWR<{ ok: true; items: ByGroup[] }>("/revenue/by-country", swrFetcher);
  const byIndustry = useSWR<{ ok: true; items: ByGroup[] }>("/revenue/by-industry", swrFetcher);
  const byTier = useSWR<{ ok: true; items: ByGroup[] }>("/revenue/by-tier", swrFetcher);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // REVENUE INTELLIGENCE</span><Badge tone="success" dot>LIVE</Badge></>}
        title="Revenue intelligence"
        subtitle="Monthly recurring revenue, today's revenue, and cohort breakdowns by country, industry, and enterprise tier."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel title="Monthly recurring revenue" icon="trending_up">
          <div className="text-[36px] font-semibold font-mono tabular-nums text-[var(--ds-success)]">{formatCurrency(summary.data?.data.mrr ?? 0)}</div>
          <div className="text-[12px] text-[var(--ds-muted)] mt-1">across all organizations</div>
        </Panel>
        <Panel title="Revenue today" icon="payments">
          <div className="text-[36px] font-semibold font-mono tabular-nums">{formatCurrency(summary.data?.data.today ?? 0)}</div>
          <div className="text-[12px] text-[var(--ds-muted)] mt-1">last 24h application revenue</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartPanel title="MRR by country" data={(byCountry.data?.items ?? []).slice(0, 12).map((r) => ({ name: r.country_iso2, mrr: Number(r.mrr) }))} />
        <ChartPanel title="MRR by industry" data={(byIndustry.data?.items ?? []).map((r) => ({ name: r.industry_slug?.replace(/_/g, " "), mrr: Number(r.mrr) }))} />
      </div>

      <Panel title="MRR by enterprise tier" icon="leaderboard" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Tier</th><th>Organizations</th><th>MRR</th><th>% of total</th></tr></thead>
            <tbody>
              {(byTier.data?.items ?? []).map((r) => {
                const total = (byTier.data?.items ?? []).reduce((acc, x) => acc + Number(x.mrr), 0);
                const pct = total ? (Number(r.mrr) / total) * 100 : 0;
                return (
                  <tr key={r.enterprise_tier}>
                    <td><Badge tone="accent">{r.enterprise_tier?.toUpperCase()}</Badge></td>
                    <td className="font-mono tabular-nums">{formatNumber(r.organizations)}</td>
                    <td className="font-mono tabular-nums text-[var(--ds-ink)]">{formatCurrency(Number(r.mrr))}</td>
                    <td className="font-mono tabular-nums">{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function ChartPanel({ title, data }: { title: string; data: { name?: string | null; mrr: number }[] }) {
  return (
    <Panel title={title} icon="bar_chart">
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--ds-hairline)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="var(--ds-muted)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--ds-muted)" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(Number(v), "USD", { compact: true })} />
            <Tooltip contentStyle={{ background: "var(--ds-surface-card)", border: "1px solid var(--ds-hairline-strong)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="mrr" fill="var(--keyra-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
