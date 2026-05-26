"use client";

import * as React from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";

interface Campaign { id: string; name: string; campaign_type: string; status: string; target_segment: string; engaged_developers: number; converted_developers: number; budget_usd: string | number; created_at: string; }
interface PipelineStage { stage: string; contacts: number; avg_likelihood: number; }
interface Contact { id: string; full_name: string; email: string | null; company: string | null; country_iso2: string | null; stage: string; engagement_score: number; adoption_likelihood: number; influence_score: number; last_touch_at: string | null; }

const STAGES = ["lead", "engaged", "evaluating", "onboarded", "scaled", "churned"];

export default function OutreachPage() {
  const [stage, setStage] = React.useState("");
  const campaigns = useSWR<{ ok: true; items: Campaign[] }>("/outreach/campaigns", swrFetcher);
  const pipeline = useSWR<{ ok: true; items: PipelineStage[] }>("/outreach/pipeline", swrFetcher);
  const qs = new URLSearchParams({ page: "1", limit: "50" });
  if (stage) qs.set("stage", stage);
  const contacts = useSWR<{ ok: true; items: Contact[]; total: number }>(`/outreach/contacts?${qs}`, swrFetcher);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // DEVELOPER OUTREACH</span><Badge tone="accent" dot>ACTIVE</Badge></>}
        title="Developer outreach program"
        subtitle="Recruitment, onboarding, SDK adoption, enterprise outreach, startup partnerships, university and government programs."
      />

      <Panel title="Pipeline" icon="hub" subtitle={`${(pipeline.data?.items ?? []).reduce((a, b) => a + b.contacts, 0)} total contacts`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {STAGES.map((s) => {
            const row = (pipeline.data?.items ?? []).find((p) => p.stage === s);
            return (
              <button
                key={s}
                onClick={() => setStage(stage === s ? "" : s)}
                className={`ds-panel rounded-md p-3 text-left transition-colors ${stage === s ? "ring-2 ring-[var(--keyra-accent)]" : ""}`}
              >
                <div className="text-[10.5px] tracking-wider text-(--ds-muted) uppercase">{s.replace(/_/g, " ")}</div>
                <div className="text-[22px] font-semibold font-mono tabular-nums">{formatNumber(row?.contacts ?? 0)}</div>
                <div className="text-[11px] text-(--ds-muted)">avg likelihood {row?.avg_likelihood ?? 0}%</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Active outreach contacts"
        icon="contact_mail"
        bodyClassName="!p-0"
        flush
        actions={stage ? <button className="ds-btn ds-btn--ghost ds-btn--sm" onClick={() => setStage("")}>Clear filter</button> : null}
      >
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Name</th><th>Company</th><th>Country</th><th>Stage</th><th>Engagement</th><th>Adoption likelihood</th><th>Influence</th><th>Last touch</th></tr></thead>
            <tbody>
              {(contacts.data?.items ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="text-(--ds-ink) font-medium">{c.full_name}<div className="text-[11px] text-(--ds-muted) font-mono">{c.email}</div></td>
                  <td>{c.company ?? "—"}</td>
                  <td className="font-mono text-[11.5px]">{c.country_iso2 ?? "—"}</td>
                  <td><StatusPill value={c.stage} /></td>
                  <td className="font-mono tabular-nums">{c.engagement_score}</td>
                  <td className="font-mono tabular-nums">{c.adoption_likelihood}%</td>
                  <td className="font-mono tabular-nums">{c.influence_score}</td>
                  <td className="text-[11.5px] font-mono">{c.last_touch_at ? formatRelativeTime(c.last_touch_at) : "—"}</td>
                </tr>
              ))}
              {contacts.isLoading && <tr><td colSpan={8} className="text-center py-12 text-(--ds-muted)">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Outreach campaigns" icon="campaign" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Name</th><th>Type</th><th>Segment</th><th>Status</th><th>Engaged</th><th>Converted</th><th>Budget</th></tr></thead>
            <tbody>
              {(campaigns.data?.items ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="text-(--ds-ink) font-medium">{c.name}</td>
                  <td><Badge tone="muted">{c.campaign_type}</Badge></td>
                  <td>{c.target_segment}</td>
                  <td><StatusPill value={c.status} /></td>
                  <td className="font-mono tabular-nums">{formatNumber(c.engaged_developers)}</td>
                  <td className="font-mono tabular-nums">{formatNumber(c.converted_developers)}</td>
                  <td className="font-mono tabular-nums">${formatNumber(Number(c.budget_usd))}</td>
                </tr>
              ))}
              {campaigns.isLoading && <tr><td colSpan={7} className="text-center py-12 text-(--ds-muted)">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
