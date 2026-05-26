"use client";

import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatNumber } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { Sdk } from "@/types/admin";

export default function SdkPage() {
  const { data, isLoading } = useSWR<{ ok: true; items: Sdk[] }>("/sdks", swrFetcher);
  const sdks = data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // SDK MANAGEMENT</span>
            <Badge tone="info" dot>LIVE</Badge>
          </>
        }
        title="SDK catalogue & adoption"
        subtitle="Every KEYRA SDK — iOS, Android, Web, Node, Python, Java, .NET, Go, Agents and Telecom — with install counts and adoption telemetry."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading ? <div className="text-[var(--ds-muted)] py-8">Loading…</div> : sdks.length === 0 ? (
          <div className="text-[var(--ds-muted)] py-8">No SDK records yet. Seed fixtures with <code>npm run seed:keyra-admin</code>.</div>
        ) : sdks.map((s) => (
          <Panel
            key={s.id}
            title={s.name}
            icon="package_2"
            subtitle={s.platform.toUpperCase()}
            actions={s.deprecated_at ? <Badge tone="warning">DEPRECATED</Badge> : <Badge tone="success" dot>STABLE</Badge>}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[24px] font-semibold text-[var(--ds-ink)] font-mono tabular-nums">{formatNumber(Number(s.install_count), { compact: true })}</div>
                <div className="text-[11px] text-[var(--ds-muted)]">installs</div>
              </div>
              <Badge tone="muted">{s.latest_version}</Badge>
            </div>
            <p className="text-[12px] text-[var(--ds-muted)] line-clamp-2">{s.description}</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ds-muted)]">
              <MaterialIcon name="code" size={12} />
              <code className="font-mono text-[10.5px]">npm i @keyra/{s.slug}</code>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
