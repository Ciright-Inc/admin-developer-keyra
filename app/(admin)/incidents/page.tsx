"use client";

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatRelativeTime } from "@/lib/utils";
import { adminFetch, swrFetcher } from "@/lib/admin-fetch";
import type { Incident } from "@/types/admin";

interface IncidentUpdate { id: string; incident_id: string; author_user_id: number | null; author_name: string | null; message: string; status_at_update: string; occurred_at: string }

export default function IncidentsPage() {
  const list = useSWR<{ ok: true; items: Incident[] }>("/incidents", swrFetcher, { refreshInterval: 12000 });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const effectiveId = selectedId ?? list.data?.items?.[0]?.id ?? null;

  const detail = useSWR<{ ok: true; data: { incident: Incident; updates: IncidentUpdate[] } }>(
    effectiveId ? `/incidents/${effectiveId}` : null,
    swrFetcher,
    { refreshInterval: 8000 },
  );

  const [draft, setDraft] = React.useState("");
  const [newStatus, setNewStatus] = React.useState("");

  const post = async () => {
    if (!effectiveId || !draft.trim()) return;
    try {
      await adminFetch(`/incidents/${effectiveId}/updates`, {
        method: "POST",
        body: { message: draft.trim(), status: newStatus || undefined },
      });
      setDraft("");
      setNewStatus("");
      toast.success("Update posted");
      void detail.mutate();
      void list.mutate();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // INCIDENT COMMAND</span><Badge tone="critical" dot>LIVE</Badge></>}
        title="Incident command center"
        subtitle="Active and recent incidents with timeline, commander assignment, and shareable status updates."
      />
      <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-3">
        <Panel title="Recent incidents" icon="emergency" subtitle={`${list.data?.items?.length ?? 0} entries`} bodyClassName="!p-0" flush>
          <ul className="max-h-[640px] overflow-auto divide-y divide-(--ds-hairline)">
            {(list.data?.items ?? []).map((i) => {
              const active = i.id === effectiveId;
              return (
                <li key={i.id}>
                  <button
                    onClick={() => setSelectedId(i.id)}
                    className={`w-full text-left p-3 transition-colors ${active ? "bg-[rgba(var(--keyra-accent-rgb),0.08)]" : "hover:bg-[rgba(255,255,255,0.03)]"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <StatusPill value={i.severity} />
                      <StatusPill value={i.status} />
                    </div>
                    <div className="text-[13px] text-(--ds-ink) font-medium leading-tight">{i.title}</div>
                    <div className="text-[11px] text-(--ds-muted) mt-1 font-mono">{formatRelativeTime(i.opened_at)} · {i.affected_scope}</div>
                  </button>
                </li>
              );
            })}
            {list.isLoading && <li className="p-6 text-center text-(--ds-muted)">Loading…</li>}
          </ul>
        </Panel>

        <Panel
          title={detail.data?.data.incident.title ?? "Select an incident"}
          icon="report"
          subtitle={detail.data ? <>Commander · {detail.data.data.incident.commander_name ?? "Unassigned"}</> : null}
          actions={detail.data ? (
            <div className="flex items-center gap-2">
              <StatusPill value={detail.data.data.incident.severity} />
              <StatusPill value={detail.data.data.incident.status} />
            </div>
          ) : null}
        >
          {!detail.data ? (
            <div className="py-10 text-center text-(--ds-muted) text-[12px]">{list.isLoading ? "Loading…" : "Pick an incident on the left"}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]">
                <Stat label="Opened" value={formatRelativeTime(detail.data.data.incident.opened_at)} />
                <Stat label="Resolved" value={detail.data.data.incident.resolved_at ? formatRelativeTime(detail.data.data.incident.resolved_at) : "—"} />
                <Stat label="Affected scope" value={detail.data.data.incident.affected_scope} />
                <Stat label="Updates" value={String(detail.data.data.updates.length)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] tracking-wider uppercase text-(--ds-muted)">Timeline</h3>
                </div>
                <ol className="relative border-l border-(--ds-hairline) ml-1.5 space-y-3">
                  {detail.data.data.updates.map((u) => (
                    <li key={u.id} className="pl-4 relative">
                      <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-(--keyra-accent)" />
                      <div className="flex items-center gap-2 mb-1">
                        {u.status_at_update ? <StatusPill value={u.status_at_update} /> : null}
                        <span className="text-[11px] text-(--ds-muted) font-mono">{formatRelativeTime(u.occurred_at)}</span>
                        {u.author_name ? <span className="text-[11px] text-(--ds-muted)">· {u.author_name}</span> : null}
                      </div>
                      <p className="text-[13px] text-(--ds-body) whitespace-pre-wrap">{u.message}</p>
                    </li>
                  ))}
                  {detail.data.data.updates.length === 0 && (
                    <li className="pl-4 text-[12px] text-(--ds-muted)">No updates posted yet.</li>
                  )}
                </ol>
              </div>

              <div className="border-t border-(--ds-hairline) pt-3">
                <h3 className="text-[12px] tracking-wider uppercase text-(--ds-muted) mb-2">Post update</h3>
                <textarea
                  className="ds-input min-h-[80px] w-full"
                  placeholder="Investigation notes, mitigations applied, next steps…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex items-center justify-between gap-2 mt-2">
                  <select className="ds-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Keep status</option>
                    <option value="investigating">Investigating</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <Button variant="accent" size="sm" onClick={post} disabled={!draft.trim()}>
                    <MaterialIcon name="send" size={13} /> Post update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-(--ds-hairline) rounded-md p-2.5">
      <div className="text-[10.5px] tracking-wider text-(--ds-muted) uppercase">{label}</div>
      <div className="text-[13px] text-(--ds-ink) mt-0.5">{value}</div>
    </div>
  );
}
