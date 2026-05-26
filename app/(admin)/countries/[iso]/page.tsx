"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface CountryDetail {
  country: { iso2: string; iso3: string; name: string; region: string; subregion: string; capital: string | null; population: number | string | null; regulatory_environment: string | null };
  timeseries: { metric_date: string; developers: number; applications: number; revenue_usd: number | string; ai_adoption_index: number | string; human_verification_density: number | string; telecom_penetration_pct: number | string; fraud_events: number }[];
}

export default function CountryDetailPage({ params }: { params: Promise<{ iso: string }> }) {
  const { iso } = use(params);
  const { data, isLoading } = useSWR<{ ok: true; data: CountryDetail }>(`/countries/${iso}`, swrFetcher);

  if (isLoading) return <div className="py-10 text-center text-[var(--ds-muted)]">Loading…</div>;
  if (!data?.data) return <div className="py-10 text-center text-[var(--ds-muted)]">Country not found.</div>;
  const { country, timeseries } = data.data;
  const points = [...timeseries].reverse().map((p) => ({
    date: new Date(p.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    developers: p.developers,
    revenue: Number(p.revenue_usd),
    fraud: p.fraud_events,
  }));
  const latest = timeseries[0];

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/countries" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1"><MaterialIcon name="arrow_back" size={12}/> Countries</Link>
            <span>{"// PROFILE"}</span>
          </>
        }
        title={country.name}
        subtitle={<span>{country.region} · {country.subregion} · Capital {country.capital ?? "—"}</span>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Panel title="Population" icon="public"><div className="font-mono text-[24px] tabular-nums">{country.population ? formatNumber(Number(country.population), { compact: true }) : "—"}</div></Panel>
        <Panel title="Developers" icon="groups"><div className="font-mono text-[24px] tabular-nums">{formatNumber(latest?.developers ?? 0)}</div><div className="text-[11px] text-[var(--ds-muted)] mt-1">latest snapshot</div></Panel>
        <Panel title="Revenue (24h)" icon="payments"><div className="font-mono text-[24px] tabular-nums">{formatCurrency(Number(latest?.revenue_usd ?? 0))}</div></Panel>
        <Panel title="Telecom penetration" icon="cell_tower"><div className="font-mono text-[24px] tabular-nums">{formatPercent(Number(latest?.telecom_penetration_pct ?? 0))}</div></Panel>
      </div>
      <Panel title="90-day trend" icon="show_chart">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--ds-hairline)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="dev" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="rev" orientation="right" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--ds-surface-card)", border: "1px solid var(--ds-hairline-strong)", borderRadius: 8, fontSize: 12 }} />
              <Line yAxisId="dev" type="monotone" dataKey="developers" stroke="var(--keyra-accent)" strokeWidth={2} dot={false} name="Developers" />
              <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="var(--ds-success)" strokeWidth={1.5} dot={false} name="Revenue" />
              <Line yAxisId="dev" type="monotone" dataKey="fraud" stroke="var(--ds-error)" strokeWidth={1.2} dot={false} name="Fraud" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Regulatory environment" icon="policy">
        <div className="flex items-start gap-3">
          <Badge tone="muted">{country.iso3}</Badge>
          <p className="text-[12.5px] text-[var(--ds-body)]">{country.regulatory_environment ?? "No regulatory notes."}</p>
        </div>
      </Panel>
    </>
  );
}
