"use client";

import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatPercent } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { TelecomCarrier } from "@/types/admin";

interface Integration {
  id: string;
  carrier_name: string;
  organization_name: string;
  country_iso2: string | null;
  status: string;
  verification_density_pct: number | string;
  monthly_requests: number | string;
}

export default function TelecomPage() {
  const carriers = useSWR<{ ok: true; items: TelecomCarrier[] }>("/telecom/carriers", swrFetcher);
  const integrations = useSWR<{ ok: true; items: Integration[] }>("/telecom/integrations", swrFetcher);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // TELECOM INTEGRATIONS</span><Badge tone="accent" dot>CARRIER-GRADE</Badge></>}
        title="Global telecom integrations"
        subtitle="Mobile network operators connected to KEYRA — SIM identity, IPification, deterministic mobile attestation across every region."
      />

      <Panel title="Carriers" icon="cell_tower" subtitle={`${(carriers.data?.items ?? []).length} carriers`} bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Carrier</th><th>Country</th><th>MCC</th><th>MNC</th><th>Trust tier</th><th>Uptime</th><th>Status</th></tr></thead>
            <tbody>
              {(carriers.data?.items ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="text-[var(--ds-ink)] font-medium">{c.name}</td>
                  <td><Badge tone="muted">{c.country_iso2 ?? "—"}</Badge></td>
                  <td className="font-mono">{c.mcc ?? "—"}</td>
                  <td className="font-mono">{c.mnc ?? "—"}</td>
                  <td><Badge tone={c.trust_tier === "carrier_grade" ? "accent" : "muted"}>{c.trust_tier}</Badge></td>
                  <td className="font-mono tabular-nums">{formatPercent(Number(c.uptime_pct), 2)}</td>
                  <td><StatusPill value={c.status} /></td>
                </tr>
              ))}
              {carriers.isLoading && <tr><td colSpan={7} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Active integrations" icon="hub" subtitle={`${(integrations.data?.items ?? []).length} integrations`} bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead><tr><th>Organization</th><th>Carrier</th><th>Country</th><th>Status</th><th>Verification density</th><th>Monthly requests</th></tr></thead>
            <tbody>
              {(integrations.data?.items ?? []).map((i) => (
                <tr key={i.id}>
                  <td className="text-[var(--ds-ink)] font-medium">{i.organization_name}</td>
                  <td>{i.carrier_name}</td>
                  <td><Badge tone="muted">{i.country_iso2 ?? "—"}</Badge></td>
                  <td><StatusPill value={i.status} /></td>
                  <td className="font-mono tabular-nums">{formatPercent(Number(i.verification_density_pct), 1)}</td>
                  <td className="font-mono tabular-nums">{formatNumber(Number(i.monthly_requests), { compact: true })}</td>
                </tr>
              ))}
              {integrations.isLoading && <tr><td colSpan={6} className="text-center py-12 text-[var(--ds-muted)]">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
