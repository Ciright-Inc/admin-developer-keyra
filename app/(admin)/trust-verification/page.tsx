"use client";

import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface OverviewByType { verification_type: string; c: number }
interface OverviewByOutcome { outcome: string; c: number }

export default function TrustVerificationPage() {
  const overview = useSWR<{ ok: true; data: { byType: OverviewByType[]; byOutcome: OverviewByOutcome[] } }>("/trust-verification/overview", swrFetcher, { refreshInterval: 10000 });
  const events = useSWR<{ ok: true; items: { id: number; verification_type: string; outcome: string; occurred_at: string; trust_delta: number; application_name?: string | null; developer_name?: string | null }[]; total: number }>("/trust-verification/events?page=1&limit=50", swrFetcher, { refreshInterval: 10000 });

  const byType = overview.data?.data?.byType ?? [];
  const byOutcome = overview.data?.data?.byOutcome ?? [];
  const totalSuccess = byOutcome.find((o) => o.outcome === "success")?.c ?? 0;
  const totalEvents = byOutcome.reduce((acc, o) => acc + o.c, 0);
  const successRate = totalEvents ? (totalSuccess / totalEvents) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // TRUST VERIFICATION</span><Badge tone="success" dot>LIVE</Badge></>}
        title="Trust verification command"
        subtitle="Human verification, KYC, SIM identity, telecom and enterprise verifications — outcomes, success rate and live stream."
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Panel title="24h verifications" icon="verified_user">
          <div className="text-[28px] font-semibold font-mono">{formatNumber(totalEvents)}</div>
          <div className="text-[11.5px] text-[var(--ds-muted)] mt-1">across all channels</div>
        </Panel>
        <Panel title="Success rate" icon="task_alt">
          <div className="text-[28px] font-semibold font-mono text-[var(--ds-success)]">{successRate.toFixed(1)}%</div>
          <div className="text-[11.5px] text-[var(--ds-muted)] mt-1">last 24h</div>
        </Panel>
        <Panel title="Outcomes" icon="pie_chart">
          <div className="flex flex-col gap-1">
            {byOutcome.map((o) => (
              <div key={o.outcome} className="flex items-center justify-between text-[12.5px]">
                <StatusPill value={o.outcome} />
                <span className="font-mono tabular-nums">{formatNumber(o.c)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="By type" icon="category">
          <div className="flex flex-col gap-1">
            {byType.map((t) => (
              <div key={t.verification_type} className="flex items-center justify-between text-[12.5px]">
                <Badge tone="muted">{t.verification_type}</Badge>
                <span className="font-mono tabular-nums">{formatNumber(t.c)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Recent verification events" icon="stream" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Type</th><th>Outcome</th><th>Trust Δ</th><th>Developer</th><th>Application</th><th>When</th></tr></thead>
            <tbody>
              {(events.data?.items ?? []).map((e) => (
                <tr key={e.id}>
                  <td><Badge tone="muted">{e.verification_type}</Badge></td>
                  <td><StatusPill value={e.outcome} /></td>
                  <td className="font-mono tabular-nums">{e.trust_delta > 0 ? `+${e.trust_delta}` : e.trust_delta}</td>
                  <td>{e.developer_name ?? "—"}</td>
                  <td>{e.application_name ?? "—"}</td>
                  <td className="text-[11.5px]">{formatRelativeTime(e.occurred_at)}</td>
                </tr>
              ))}
              {events.isLoading && <tr><td colSpan={6} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
