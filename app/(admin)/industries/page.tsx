"use client";

import Link from "next/link";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { formatNumber } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { IndustryRow } from "@/types/admin";

export default function IndustriesPage() {
  const { data } = useSWR<{ ok: true; items: IndustryRow[] }>("/industries", swrFetcher);
  const industries = data?.items ?? [];
  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // INDUSTRY SPECIALIZATION</span><Badge tone="info" dot>LIVE</Badge></>}
        title="Industry intelligence"
        subtitle="Every regulated and unregulated vertical KEYRA serves — adoption, trust requirements, SDK utilization and compliance posture."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {industries.map((i) => (
          <Link key={i.slug} href={`/industries/${i.slug}`} className="block group">
            <Panel
              title={i.name}
              icon={i.icon || "category"}
              actions={<Badge tone="muted">{formatNumber(i.developer_count)} devs</Badge>}
            >
              <p className="text-[12px] text-[var(--ds-muted)] line-clamp-2 mb-3">{i.description}</p>
              <div className="grid grid-cols-2 gap-3 text-[11.5px]">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--ds-muted)] mb-0.5">Orgs</div>
                  <div className="font-mono tabular-nums text-[var(--ds-ink)]">{formatNumber(i.organization_count)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--ds-muted)] mb-0.5">Compliance</div>
                  <div className="text-[var(--ds-body)] truncate">{i.compliance_requirements?.split(",")[0] ?? "—"}</div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-[var(--keyra-accent)] inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Open profile <MaterialIcon name="arrow_forward" size={12} />
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
