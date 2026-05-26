"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatNumber, formatPercent } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface IndustryDetail {
  industry: { slug: string; name: string; icon: string; description: string; trust_requirements: string; compliance_requirements: string };
  timeseries: { metric_date: string; developers: number; applications: number; sdk_utilization_pct: number | string; ai_utilization_pct: number | string; fraud_events: number; telecom_dependency_score: number | string }[];
}

export default function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading } = useSWR<{ ok: true; data: IndustryDetail }>(`/industries/${slug}`, swrFetcher);
  if (isLoading) return <div className="py-10 text-center text-[var(--ds-muted)]">Loading…</div>;
  if (!data?.data) return <div className="py-10 text-center text-[var(--ds-muted)]">Industry not found.</div>;
  const { industry, timeseries } = data.data;
  const points = [...timeseries].reverse().map((p) => ({
    date: new Date(p.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    devs: p.developers,
    sdk: Number(p.sdk_utilization_pct),
    ai: Number(p.ai_utilization_pct),
    fraud: p.fraud_events,
  }));
  const latest = timeseries[0];

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/industries" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1"><MaterialIcon name="arrow_back" size={12}/> Industries</Link>
            <span>{"// VERTICAL"}</span>
          </>
        }
        title={industry.name}
        subtitle={industry.description}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Panel title="Developers" icon="groups"><div className="font-mono text-[24px] tabular-nums">{formatNumber(latest?.developers ?? 0)}</div></Panel>
        <Panel title="SDK utilization" icon="package_2"><div className="font-mono text-[24px] tabular-nums">{formatPercent(Number(latest?.sdk_utilization_pct ?? 0))}</div></Panel>
        <Panel title="AI utilization" icon="smart_toy"><div className="font-mono text-[24px] tabular-nums">{formatPercent(Number(latest?.ai_utilization_pct ?? 0))}</div></Panel>
        <Panel title="Telecom dependency" icon="cell_tower"><div className="font-mono text-[24px] tabular-nums">{formatPercent(Number(latest?.telecom_dependency_score ?? 0))}</div></Panel>
      </div>
      <Panel title="Requirements" icon="policy">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px]">
          <div><div className="text-[10.5px] uppercase tracking-wide text-[var(--ds-muted)] mb-1">Trust requirements</div><div>{industry.trust_requirements}</div></div>
          <div><div className="text-[10.5px] uppercase tracking-wide text-[var(--ds-muted)] mb-1">Compliance frameworks</div><div className="flex flex-wrap gap-1.5">{industry.compliance_requirements.split(",").map((c) => <Badge key={c} tone="muted">{c.trim()}</Badge>)}</div></div>
        </div>
      </Panel>
      <Panel title="30-day adoption" icon="show_chart">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--ds-hairline)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--ds-muted)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--ds-surface-card)", border: "1px solid var(--ds-hairline-strong)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="devs" stroke="var(--keyra-accent)" strokeWidth={2} dot={false} name="Developers" />
              <Line type="monotone" dataKey="sdk" stroke="var(--ds-success)" strokeWidth={1.5} dot={false} name="SDK %" />
              <Line type="monotone" dataKey="ai" stroke="var(--keyra-accent-2)" strokeWidth={1.5} dot={false} name="AI %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}
