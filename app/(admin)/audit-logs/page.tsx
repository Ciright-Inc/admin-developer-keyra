"use client";

import * as React from "react";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { AuditLog, ListResponse } from "@/types/admin";

export default function AuditLogsPage() {
  const [actor, setActor] = React.useState("");
  const [action, setAction] = React.useState("");
  const [targetType, setTargetType] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  const filterKey = `${actor}|${action}|${targetType}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const qs = new URLSearchParams({ page: String(page), limit: "75" });
  if (actor) qs.set("actor", actor);
  if (action) qs.set("action", action);
  if (targetType) qs.set("target_type", targetType);

  const data = useSWR<ListResponse<AuditLog>>(`/audit-logs?${qs}`, swrFetcher);
  const total = data.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 75));

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // AUDIT LOGS</span><Badge tone="accent" dot>TAMPER-EVIDENT</Badge></>}
        title="Global audit trail"
        subtitle="Tamper-evident actions taken by KEYRA super-admins across the entire ecosystem. Filter by actor, action, or target."
      />
      <Panel
        title="Audit ledger"
        icon="history"
        subtitle={`${total} entries`}
        bodyClassName="!p-0"
        flush
        actions={
          <div className="flex items-center gap-2">
            <input className="ds-input !min-w-[140px] !text-[11.5px] !py-1" placeholder="Actor user id" value={actor} onChange={(e) => setActor(e.target.value)} />
            <input className="ds-input !min-w-[160px] !text-[11.5px] !py-1" placeholder="Action key" value={action} onChange={(e) => setAction(e.target.value)} />
            <input className="ds-input !min-w-[160px] !text-[11.5px] !py-1" placeholder="Target type" value={targetType} onChange={(e) => setTargetType(e.target.value)} />
            <Button variant="ghost" size="sm" onClick={() => { setActor(""); setAction(""); setTargetType(""); }}>Reset</Button>
          </div>
        }
      >
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th><th></th></tr></thead>
            <tbody>
              {(data.data?.items ?? []).map((l) => {
                const isOpen = !!expanded[l.id];
                return (
                  <React.Fragment key={l.id}>
                    <tr>
                      <td className="text-[11.5px] font-mono">{formatRelativeTime(l.occurred_at)}</td>
                      <td>
                        <div className="text-(--ds-ink)">{l.actor_name ?? `user#${l.actor_user_id ?? "?"}`}</div>
                        {l.actor_phone && <div className="text-[10.5px] text-(--ds-muted) font-mono">{l.actor_phone}</div>}
                      </td>
                      <td><Badge tone="accent">{l.action}</Badge></td>
                      <td className="text-[12px]">{l.target_type}{l.target_id ? <span className="text-(--ds-muted)"> · {l.target_id}</span> : null}</td>
                      <td className="text-[11px] font-mono text-(--ds-muted)">{l.ip_address ?? "—"}</td>
                      <td>
                        <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => ({ ...e, [l.id]: !e[l.id] }))}>
                          <MaterialIcon name={isOpen ? "expand_less" : "expand_more"} size={13} /> {isOpen ? "Hide" : "Payload"}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="bg-(--ds-surface-deep)">
                          <pre className="text-[11px] text-(--ds-body) font-mono overflow-x-auto whitespace-pre-wrap p-3 m-0">{JSON.stringify(l.payload, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {data.isLoading && <tr><td colSpan={6} className="text-center py-12 text-(--ds-muted)">Loading…</td></tr>}
              {!data.isLoading && (data.data?.items ?? []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-(--ds-muted)">No audit entries match the filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="ds-pagination">
          <div className="text-[11px] text-(--ds-muted)">Page {page} of {pages}</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Panel>
    </>
  );
}
