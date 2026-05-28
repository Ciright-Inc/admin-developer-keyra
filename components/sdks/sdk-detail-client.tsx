"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { SlideToggle } from "@/components/ui/slide-toggle";
import { formatRelativeTime } from "@/lib/utils";
import { SdkFormDrawer } from "@/components/sdks/sdk-form-drawer";
import {
  createVersion,
  deprecateSdk,
  getSdk,
  listVersions,
  publishVersion,
  updateSdk,
} from "@/features/sdks/services/sdk-service";
import type { SdkCatalogue, SdkVersion } from "@/types/admin";

export function SdkDetailClient({ id }: { id: string }) {
  const { data: sdk, error, isLoading, mutate } = useSWR(`/sdks/${id}`, () => getSdk(id), {
    revalidateOnFocus: false,
  });
  const versions = useSWR(`/sdks/${id}/versions`, () => listVersions(id), { revalidateOnFocus: false });

  const [editOpen, setEditOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [newVersion, setNewVersion] = React.useState("");
  const [changelog, setChangelog] = React.useState("");
  const [publishNow, setPublishNow] = React.useState(true);

  if (isLoading) {
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-muted)]">
        <MaterialIcon name="hourglass" size={18} /> Loading SDK…
      </div>
    );
  }

  if (error || !sdk) {
    return (
      <div className="ds-panel p-12 text-center">
        <div className="text-[15px] text-[var(--ds-ink)]">SDK not found</div>
        <Link href="/sdks" className="mt-3 inline-flex text-[var(--keyra-accent)] text-[13px]">
          Back to catalogue
        </Link>
      </div>
    );
  }

  async function handleAddVersion() {
    if (!newVersion.trim()) return;
    setBusy(true);
    try {
      await createVersion(id, { version: newVersion.trim(), changelog: changelog.trim(), publish_now: publishNow });
      setNewVersion("");
      setChangelog("");
      await versions.mutate();
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish(versionId: string) {
    setBusy(true);
    try {
      await publishVersion(id, versionId);
      await versions.mutate();
      await mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/sdks" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)]">
            ← SDK Management
          </Link>
        }
        title={sdk.name}
        subtitle={`${sdk.slug} · ${sdk.platform} · ${sdk.language || "—"}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(true)}>
              <MaterialIcon name="edit" size={14} /> Edit
            </Button>
            {sdk.status !== "deprecated" ? (
              <Button
                variant="ghost"
                onClick={async () => {
                  if (!confirm("Deprecate this SDK?")) return;
                  setBusy(true);
                  try {
                    await deprecateSdk(id);
                    await mutate();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Deprecate
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Overview" icon="info">
          <dl className="grid grid-cols-2 gap-3 text-[12px]">
            <dt className="text-[var(--ds-muted)]">Status</dt>
            <dd>
              <Badge tone={sdk.status === "stable" ? "success" : sdk.status === "coming_soon" ? "warning" : "muted"}>
                {sdk.status}
              </Badge>
            </dd>
            <dt className="text-[var(--ds-muted)]">Latest version</dt>
            <dd className="font-mono">{sdk.latest_version || "—"}</dd>
            <dt className="text-[var(--ds-muted)]">Versions</dt>
            <dd>{sdk.version_count ?? versions.data?.length ?? 0}</dd>
            <dt className="text-[var(--ds-muted)]">Featured</dt>
            <dd>{sdk.featured ? "Yes" : "No"}</dd>
            <dt className="text-[var(--ds-muted)]">Updated</dt>
            <dd>{sdk.updated_at ? formatRelativeTime(sdk.updated_at) : "—"}</dd>
          </dl>
          {sdk.description ? <p className="mt-4 text-[12px] text-[var(--ds-muted)]">{sdk.description}</p> : null}
        </Panel>

        <Panel title="Portal preview" icon="visibility" subtitle="How developers see this card">
          <div className="rounded-lg border border-[var(--ds-hairline)] bg-[var(--ds-surface-strong)] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold text-[var(--ds-ink)]">{sdk.name}</span>
              <Badge tone={sdk.status === "stable" ? "success" : "warning"}>{sdk.status === "stable" ? "Stable" : "Coming soon"}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-[var(--ds-muted)]">{sdk.language}</p>
            <pre className="mt-3 text-[10.5px] font-mono whitespace-pre-wrap text-[var(--ds-ink)] bg-[var(--ds-surface)] p-2 rounded border border-[var(--ds-hairline)] max-h-32 overflow-auto">
              {sdk.install_command || "No install command"}
            </pre>
          </div>
        </Panel>
      </div>

      <Panel title="Version history" icon="history" className="mt-4" bodyClassName="!p-0" flush>
        <div className="px-4 py-3 border-b border-[var(--ds-hairline)] flex flex-wrap gap-2 items-end">
          <label className="flex flex-col gap-1 text-[11px]">
            <span className="text-[var(--ds-muted)]">Version</span>
            <input className="ds-input w-28 font-mono" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} placeholder="1.0.0" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] flex-1 min-w-[200px]">
            <span className="text-[var(--ds-muted)]">Changelog</span>
            <input className="ds-input" value={changelog} onChange={(e) => setChangelog(e.target.value)} />
          </label>
          <SlideToggle
            id="sdk-version-publish-now"
            variant="inline"
            label="Publish now"
            checked={publishNow}
            disabled={busy}
            onChange={setPublishNow}
            className="shrink-0"
          />
          <Button variant="accent" size="sm" disabled={busy || !newVersion.trim()} onClick={() => void handleAddVersion()}>
            Add version
          </Button>
        </div>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead>
              <tr>
                <th>Version</th>
                <th>Status</th>
                <th>Latest</th>
                <th>Published</th>
                <th>Changelog</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(versions.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--ds-muted)] text-[12px]">
                    No versions yet
                  </td>
                </tr>
              ) : (
                (versions.data ?? []).map((v: SdkVersion) => (
                  <tr key={v.id}>
                    <td className="font-mono text-[13px]">{v.version}</td>
                    <td>
                      <Badge tone={v.status === "published" ? "success" : "muted"}>{v.status}</Badge>
                    </td>
                    <td>{v.is_latest ? <MaterialIcon name="check_circle" size={16} className="text-[var(--keyra-accent)]" /> : "—"}</td>
                    <td className="text-[11px] text-[var(--ds-muted)]">
                      {v.published_at ? formatRelativeTime(v.published_at) : "—"}
                    </td>
                    <td className="text-[11px] text-[var(--ds-muted)] max-w-[240px] truncate">{v.changelog || "—"}</td>
                    <td className="text-right">
                      {v.status === "draft" ? (
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => void handlePublish(v.id)}>
                          Publish
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <SdkFormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={sdk}
        busy={busy}
        onSave={async (input) => {
          setBusy(true);
          try {
            await updateSdk(id, input);
            setEditOpen(false);
            await mutate();
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
