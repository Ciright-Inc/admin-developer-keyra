"use client";

import * as React from "react";
import useSWR from "swr";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { AiAgent, ListResponse } from "@/types/admin";

export default function AiAgentsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 30;

  const filterKey = search;
  const [prevKey, setPrevKey] = React.useState(filterKey);
  if (prevKey !== filterKey) { setPrevKey(filterKey); setPage(1); }

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const { data, isLoading } = useSWR<ListResponse<AiAgent>>(`/ai-agents?${qs}`, swrFetcher, { revalidateOnFocus: false });
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // AI AGENT ECOSYSTEM</span><Badge tone="info" dot>LIVE</Badge></>}
        title="AI agent ecosystem"
        subtitle="Every autonomous AI agent active in the KEYRA network — bound to a verified human owner, with trust ratings, escalation events and inter-agent relationships."
      />
      <Panel
        title="Active AI agents"
        icon="smart_toy"
        subtitle={`${formatNumber(total)} agents`}
        bodyClassName="!p-0"
        flush
        actions={
          <div className="relative">
            <MaterialIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents…" className="ds-input ds-input--icon" />
          </div>
        }
      >
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead>
              <tr>
                <th>Agent</th><th>Model</th><th>Organization</th><th>Human owner</th><th>Status</th><th>Trust</th><th>Behavior</th><th>API 24h</th><th>Escalations</th><th>Verif chain</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={10} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr> :
               rows.length === 0 ? <tr><td colSpan={10} className="text-center py-16 text-[var(--ds-muted)]">No AI agents yet.</td></tr> :
               rows.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/ai-agents/${a.id}`} className="text-[var(--ds-ink)] hover:text-[var(--keyra-accent)] font-medium">{a.name}</Link></td>
                  <td><Badge tone="muted">{a.model_type}</Badge></td>
                  <td>{a.organization_name ?? "—"}</td>
                  <td>{a.owner_name ?? <span className="text-[var(--ds-error)]">UNOWNED</span>}</td>
                  <td><StatusPill value={a.status} /></td>
                  <td><Badge tone={a.trust_rating > 80 ? "success" : a.trust_rating > 50 ? "warning" : "critical"}>{a.trust_rating}</Badge></td>
                  <td className="font-mono tabular-nums">{a.behavioral_score}</td>
                  <td className="font-mono tabular-nums">{formatNumber(Number(a.api_consumption_24h), { compact: true })}</td>
                  <td>{a.escalation_count > 0 ? <Badge tone="warning">{a.escalation_count}</Badge> : <span className="font-mono">0</span>}</td>
                  <td><StatusPill value={a.human_verification_chain_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ds-pagination">
          <div>{formatNumber(total)} agents total</div>
          <div className="ds-pagination__actions">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><MaterialIcon name="chevron_left" size={14}/> Prev</Button>
            <Button variant="ghost" size="sm" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>Next <MaterialIcon name="chevron_right" size={14}/></Button>
          </div>
        </div>
      </Panel>
    </>
  );
}
