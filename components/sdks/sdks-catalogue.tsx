"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import { SdkFormDrawer } from "@/components/sdks/sdk-form-drawer";
import { SdkRowActions } from "@/components/sdks/sdk-row-actions";
import {
  createSdk,
  deleteSdk,
  deprecateSdk,
  updateSdk,
} from "@/features/sdks/services/sdk-service";
import type { SdkCatalogue } from "@/types/admin";

function statusTone(status: string): "success" | "warning" | "muted" {
  if (status === "stable") return "success";
  if (status === "coming_soon") return "warning";
  return "muted";
}

export function SdksCatalogue() {
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SdkCatalogue | null>(null);
  const [busy, setBusy] = React.useState(false);

  const query = search ? `?search=${encodeURIComponent(search)}&limit=100` : "?limit=100";
  const list = useSWR<{ ok: true; items: SdkCatalogue[]; total: number }>(`/sdks${query}`, swrFetcher, {
    refreshInterval: 30000,
  });

  const rows = list.data?.items ?? [];
  const loading = list.isLoading;

  async function handleSave(input: Parameters<typeof createSdk>[0]) {
    setBusy(true);
    try {
      if (editing) await updateSdk(editing.id, input);
      else await createSdk(input);
      setDialogOpen(false);
      setEditing(null);
      await list.mutate();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeprecate(id: string) {
    if (!confirm("Deprecate this SDK? It will be hidden from the developer portal.")) return;
    setBusy(true);
    try {
      await deprecateSdk(id);
      await list.mutate();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this SDK? Only allowed when no published versions exist.")) return;
    setBusy(true);
    try {
      await deleteSdk(id);
      await list.mutate();
    } catch (e) {
      alert((e as Error).message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(sdk: SdkCatalogue) {
    setEditing(sdk);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="SDK catalogue"
        icon="inventory_2"
        subtitle={loading ? "Loading…" : `${list.data?.total ?? rows.length} published packages`}
        bodyClassName="!p-0"
        flush
        actions={
          <div className="flex items-center gap-2">
            <input
              className="ds-input w-48"
              placeholder="Search name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="accent" size="sm" onClick={openCreate}>
              <MaterialIcon name="add" size={14} /> Add SDK
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void list.mutate()}>
              <MaterialIcon name="refresh" size={13} />
            </Button>
          </div>
        }
      >
        <div className="px-4 pt-4 pb-3 border-b border-[var(--ds-hairline)]">
          <p className="text-[12px] text-[var(--ds-muted)] leading-relaxed max-w-3xl">
            Official KEYRA SDK packages shown on the developer portal. Manage install commands, versions, and
            publication status here.
          </p>
        </div>
        <div className="ds-table-wrap is-scrollable !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Language</th>
                <th>Status</th>
                <th>Latest</th>
                <th>Featured</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[var(--ds-muted)]">
                    Loading catalogue…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[var(--ds-muted)]">
                    No SDKs in catalogue. Run bootstrap or add one.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/sdks/${row.id}`} className="text-[13px] font-medium text-[var(--keyra-accent)] hover:underline">
                        {row.name}
                      </Link>
                      <div className="font-mono text-[10.5px] text-[var(--ds-muted)]">{row.slug}</div>
                    </td>
                    <td className="text-[12px]">{row.platform}</td>
                    <td className="text-[12px] text-[var(--ds-muted)]">{row.language || "—"}</td>
                    <td>
                      <Badge tone={statusTone(row.status)} dot={row.status === "stable"}>
                        {row.status.toUpperCase().replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="font-mono text-[12px]">{row.latest_version || "—"}</td>
                    <td>{row.featured ? <MaterialIcon name="star" size={16} className="text-[var(--keyra-accent)]" /> : "—"}</td>
                    <td className="text-[11.5px] text-[var(--ds-muted)] whitespace-nowrap">
                      {row.updated_at ? formatRelativeTime(row.updated_at) : "—"}
                    </td>
                    <td className="text-right">
                      <SdkRowActions
                        sdk={row}
                        busy={busy}
                        onEdit={openEdit}
                        onDeprecate={(id) => void handleDeprecate(id)}
                        onDelete={(id) => void handleDelete(id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <SdkFormDrawer
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing}
        onSave={handleSave}
        busy={busy}
      />
    </div>
  );
}
