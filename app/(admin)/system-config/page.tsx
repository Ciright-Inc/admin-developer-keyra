"use client";

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatRelativeTime } from "@/lib/utils";
import { adminFetch, swrFetcher } from "@/lib/admin-fetch";
import type { SystemConfigEntry } from "@/types/admin";

interface HistoryEntry {
  id: string;
  key: string;
  old_value: unknown;
  new_value: unknown;
  changed_by: number | null;
  changed_by_name: string | null;
  changed_at: string;
}

export default function SystemConfigPage() {
  const list = useSWR<{ ok: true; items: SystemConfigEntry[] }>("/system-config", swrFetcher);
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const grouped = React.useMemo(() => {
    const items = list.data?.items ?? [];
    const out: Record<string, SystemConfigEntry[]> = {};
    for (const item of items) {
      const cat = item.category || "general";
      (out[cat] = out[cat] || []).push(item);
    }
    return out;
  }, [list.data]);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // SYSTEM CONFIG</span><Badge tone="critical" dot>SOVEREIGN</Badge></>}
        title="System configuration"
        subtitle="Versioned, audited global flags and platform parameters. Every change is recorded in immutable history."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-3">
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, items]) => (
            <Panel key={cat} title={cat.replace(/_/g, " ").toUpperCase()} icon="tune" bodyClassName="!p-0" flush>
              <table className="ds-table ds-table--compact">
                <thead><tr><th>Key</th><th>Value</th><th>Updated</th><th></th></tr></thead>
                <tbody>
                  {items.map((entry) => (
                    <ConfigRow key={entry.key} entry={entry} onSelect={() => setSelectedKey(entry.key)} selected={selectedKey === entry.key} onSaved={() => void list.mutate()} />
                  ))}
                </tbody>
              </table>
            </Panel>
          ))}
          {list.isLoading && (
            <Panel title="Loading" icon="hourglass_empty"><div className="text-(--ds-muted) text-[12px]">Loading config keys…</div></Panel>
          )}
        </div>

        <HistoryPanel selectedKey={selectedKey} />
      </div>
    </>
  );
}

function ConfigRow({ entry, onSelect, selected, onSaved }: { entry: SystemConfigEntry; onSelect: () => void; selected: boolean; onSaved: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(() => JSON.stringify(entry.value, null, 2));
  const [busy, setBusy] = React.useState(false);

  const save = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      toast.error("Invalid JSON");
      return;
    }
    setBusy(true);
    try {
      await adminFetch(`/system-config/${encodeURIComponent(entry.key)}`, { method: "PATCH", body: { value: parsed } });
      toast.success("Saved");
      setEditing(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr onClick={onSelect} className={selected ? "bg-[rgba(var(--keyra-accent-rgb),0.06)] cursor-pointer" : "cursor-pointer"}>
        <td className="text-(--ds-ink) font-mono text-[12px]">{entry.key}<div className="text-[11px] text-(--ds-muted) font-sans">{entry.description}</div></td>
        <td className="font-mono text-[11.5px] max-w-[260px]"><div className="truncate" title={JSON.stringify(entry.value)}>{JSON.stringify(entry.value)}</div></td>
        <td className="text-[11.5px] font-mono text-(--ds-muted)">{formatRelativeTime(entry.updated_at)}</td>
        <td><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditing((v) => !v); }}><MaterialIcon name={editing ? "close" : "edit"} size={13} /> {editing ? "Cancel" : "Edit"}</Button></td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={4} className="bg-(--ds-surface-deep) p-3">
            <textarea className="ds-input min-h-[140px] w-full font-mono text-[11.5px]" value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} />
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={busy}>Cancel</Button>
              <Button variant="accent" size="sm" onClick={save} disabled={busy}><MaterialIcon name="save" size={13} /> Save</Button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function HistoryPanel({ selectedKey }: { selectedKey: string | null }) {
  const history = useSWR<{ ok: true; items: HistoryEntry[] }>(
    selectedKey ? `/system-config/${encodeURIComponent(selectedKey)}/history` : null,
    swrFetcher,
  );
  return (
    <Panel title={selectedKey ? `History · ${selectedKey}` : "Change history"} icon="manage_history" subtitle={history.data ? `${history.data.items.length} versions` : null}>
      {!selectedKey ? (
        <div className="text-(--ds-muted) text-[12px] py-6 text-center">Select a config row to view its change history.</div>
      ) : (
        <ol className="relative border-l border-(--ds-hairline) ml-1.5 space-y-3">
          {(history.data?.items ?? []).map((h) => (
            <li key={h.id} className="pl-4 relative">
              <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-(--keyra-accent)" />
              <div className="flex items-center gap-2 mb-1">
                <Badge tone="accent">v{(history.data!.items.length - history.data!.items.indexOf(h))}</Badge>
                <span className="text-[11px] text-(--ds-muted) font-mono">{formatRelativeTime(h.changed_at)}</span>
                {h.changed_by_name ? <span className="text-[11px] text-(--ds-muted)">· {h.changed_by_name}</span> : null}
              </div>
              <div className="text-[11px] font-mono text-(--ds-muted)">old: <span className="text-(--ds-body)">{JSON.stringify(h.old_value)}</span></div>
              <div className="text-[11px] font-mono text-(--ds-muted)">new: <span className="text-(--ds-success)">{JSON.stringify(h.new_value)}</span></div>
            </li>
          ))}
          {history.isLoading && <li className="pl-4 text-[12px] text-(--ds-muted)">Loading…</li>}
          {!history.isLoading && (history.data?.items ?? []).length === 0 && (
            <li className="pl-4 text-[12px] text-(--ds-muted)">No history recorded for this key yet.</li>
          )}
        </ol>
      )}
    </Panel>
  );
}
