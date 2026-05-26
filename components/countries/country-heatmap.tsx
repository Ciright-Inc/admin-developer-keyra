"use client";

import * as React from "react";
import Link from "next/link";
import { COUNTRY_CENTROIDS, project } from "@/lib/country-geo";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { CountryRow } from "@/types/admin";

interface Props {
  countries: CountryRow[];
}

export function CountryHeatmap({ countries }: Props) {
  const width = 960;
  const height = 460;

  const maxDev = Math.max(1, ...countries.map((c) => c.developer_count));
  const [hovered, setHovered] = React.useState<CountryRow | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[var(--ds-hairline)] bg-[var(--ds-canvas-soft)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full h-auto">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(94,180,255,0.04)" />
            <stop offset="100%" stopColor="rgba(94,180,255,0.00)" />
          </linearGradient>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#bg)" />
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Equator/meridian guides */}
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" />
        <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="rgba(255,255,255,0.05)" />

        {countries.map((c) => {
          const geo = COUNTRY_CENTROIDS[c.iso2];
          if (!geo) return null;
          const [x, y] = project(geo.lon, geo.lat, width, height);
          const intensity = c.developer_count / maxDev;
          const radius = 4 + Math.sqrt(intensity) * 28;
          return (
            <Link key={c.iso2} href={`/countries/${c.iso2}`}>
              <g
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={x} cy={y} r={radius} fill="rgba(94,180,255,0.16)" stroke="rgba(94,180,255,0.4)" strokeWidth={1} />
                <circle cx={x} cy={y} r={3.5} fill="var(--keyra-accent)" />
                <text x={x + 8} y={y + 4} fontSize="9.5" fill="rgba(255,255,255,0.78)" style={{ pointerEvents: "none" }}>{c.iso2}</text>
              </g>
            </Link>
          );
        })}
      </svg>
      {hovered && (
        <div className="absolute right-3 top-3 px-3 py-2 rounded-md bg-[var(--ds-surface-card)] border border-[var(--ds-hairline-strong)] text-[12px] shadow-lg">
          <div className="text-[var(--ds-ink)] font-semibold">{hovered.name}</div>
          <div className="text-[var(--ds-muted)] text-[11px]">{hovered.region} · {hovered.subregion}</div>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono">
            <span className="text-[var(--ds-muted)] text-[10.5px]">Developers</span><span>{formatNumber(hovered.developer_count)}</span>
            <span className="text-[var(--ds-muted)] text-[10.5px]">Organizations</span><span>{formatNumber(hovered.organization_count)}</span>
            <span className="text-[var(--ds-muted)] text-[10.5px]">MRR</span><span>{formatCurrency(Number(hovered.mrr), "USD", { compact: true })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
