"use client";

import Link from "next/link";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { CountryHeatmap } from "@/components/countries/country-heatmap";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import type { CountryRow } from "@/types/admin";

export default function CountriesPage() {
  const { data, isLoading } = useSWR<{ ok: true; items: CountryRow[] }>("/countries", swrFetcher);
  const countries = data?.items ?? [];
  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // COUNTRY INTELLIGENCE</span><Badge tone="accent" dot>GLOBAL</Badge></>}
        title="Country intelligence center"
        subtitle="Live KEYRA adoption across every country — developers, applications, revenue, trust density, AI adoption, telecom penetration."
      />
      <Panel title="Global heatmap" icon="public" subtitle={`${countries.length} countries with KEYRA presence`}>
        {isLoading ? <div className="py-10 text-center text-[var(--ds-muted)]">Loading map…</div> : <CountryHeatmap countries={countries} />}
      </Panel>
      <Panel title="Country leaderboard" icon="leaderboard" bodyClassName="!p-0" flush>
        <div className="ds-table-wrap !rounded-none !border-0">
          <table className="ds-table ds-table--compact">
            <thead>
              <tr>
                <th>#</th><th>Country</th><th>Region</th><th>Developers</th><th>Organizations</th><th>MRR</th><th>Regulatory</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c, idx) => (
                <tr key={c.iso2}>
                  <td className="font-mono tabular-nums text-[var(--ds-muted)]">{idx + 1}</td>
                  <td><Link href={`/countries/${c.iso2}`} className="text-[var(--ds-ink)] font-medium hover:text-[var(--keyra-accent)]">{c.name}</Link><span className="text-[10.5px] text-[var(--ds-muted)] font-mono ml-2">{c.iso2}</span></td>
                  <td>{c.region} / {c.subregion}</td>
                  <td className="font-mono tabular-nums">{formatNumber(c.developer_count)}</td>
                  <td className="font-mono tabular-nums">{formatNumber(c.organization_count)}</td>
                  <td className="font-mono tabular-nums">{formatCurrency(Number(c.mrr), "USD", { compact: true })}</td>
                  <td className="text-[11.5px] text-[var(--ds-muted)] truncate max-w-[280px]">{c.regulatory_environment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
