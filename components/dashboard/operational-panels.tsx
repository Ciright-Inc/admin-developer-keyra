"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";
import { adminFetch } from "@/lib/admin-fetch";
import { formatNumber, formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { CountryRow, IndustryRow, Incident, ListResponse } from "@/types/admin";

export function OperationalPanels() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <TopCountriesPanel />
      <TopIndustriesPanel />
      <ActiveIncidentsPanel />
    </div>
  );
}

function TopCountriesPanel() {
  const [items, setItems] = useState<CountryRow[]>([]);
  useEffect(() => {
    void adminFetch<ListResponse<CountryRow>>("/countries")
      .then((r) => setItems(r.items.slice(0, 6)))
      .catch(() => setItems([]));
  }, []);
  return (
    <Panel title="Top countries" icon="public" subtitle="By developer count">
      <div className="flex flex-col gap-2">
        {items.length === 0 ? <EmptyHint label="No country telemetry yet" icon="public" /> : null}
        {items.map((c, idx) => (
          <div key={c.iso2} className="flex items-center gap-3">
            <div className="w-6 text-[var(--ds-muted)] font-mono text-[11px] tabular-nums">{String(idx + 1).padStart(2, "0")}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--ds-ink)] font-medium truncate">{c.name}</div>
              <div className="text-[11px] text-[var(--ds-muted)] font-mono">{c.iso2} · {c.region}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-[var(--ds-ink)] font-mono tabular-nums">{formatNumber(c.developer_count, { compact: true })}</div>
              <div className="text-[10.5px] text-[var(--ds-muted)] font-mono">{formatCurrency(Number(c.mrr) || 0, "USD", { compact: true })} MRR</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TopIndustriesPanel() {
  const [items, setItems] = useState<IndustryRow[]>([]);
  useEffect(() => {
    void adminFetch<ListResponse<IndustryRow>>("/industries")
      .then((r) => setItems(r.items.slice(0, 6)))
      .catch(() => setItems([]));
  }, []);
  return (
    <Panel title="Top industries" icon="category" subtitle="By developer adoption">
      <div className="flex flex-col gap-2">
        {items.length === 0 ? <EmptyHint label="No industry data yet" icon="category" /> : null}
        {items.map((i) => (
          <div key={i.slug} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[var(--ds-radius-sm)] bg-[var(--ds-surface-strong)] grid place-items-center text-[var(--ds-ink)] border border-[var(--ds-hairline-strong)]">
              <MaterialIcon name={i.icon || "category"} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--ds-ink)] font-medium truncate">{i.name}</div>
              <div className="text-[11px] text-[var(--ds-muted)] truncate">{i.trust_requirements}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-[var(--ds-ink)] font-mono tabular-nums">{formatNumber(i.developer_count, { compact: true })}</div>
              <div className="text-[10.5px] text-[var(--ds-muted)] font-mono">{formatNumber(i.organization_count)} orgs</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActiveIncidentsPanel() {
  const [items, setItems] = useState<Incident[]>([]);
  useEffect(() => {
    void adminFetch<ListResponse<Incident>>("/incidents")
      .then((r) => setItems(r.items.filter((i) => i.status !== "resolved").slice(0, 6)))
      .catch(() => setItems([]));
  }, []);
  return (
    <Panel title="Active incidents" icon="emergency" subtitle="Last 24h" actions={items.length ? <Badge tone="critical" dot>{items.length} OPEN</Badge> : <Badge tone="success" dot>ALL CLEAR</Badge>}>
      <div className="flex flex-col gap-2.5">
        {items.length === 0 ? <EmptyHint label="No active incidents" icon="check_circle" tone="success" /> : null}
        {items.map((inc) => (
          <div key={inc.id} className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-[var(--ds-surface-strong)] transition-colors">
            <Badge tone={severityTone(inc.severity)}>{inc.severity.toUpperCase()}</Badge>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--ds-ink)] font-medium truncate">{inc.title}</div>
              <div className="text-[11px] text-[var(--ds-muted)] font-mono truncate">{inc.affected_scope} · opened {formatRelativeTime(inc.opened_at)}</div>
            </div>
            <Badge tone="muted">{inc.status}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EmptyHint({ label, icon, tone = "muted" }: { label: string; icon: string; tone?: "muted" | "success" }) {
  return (
    <div className="flex items-center gap-2 py-4 text-[12.5px]">
      <MaterialIcon name={icon} size={14} className={tone === "success" ? "text-[var(--ds-success)]" : "text-[var(--ds-muted)]"} />
      <span className={tone === "success" ? "text-[var(--ds-success)]" : "text-[var(--ds-muted)]"}>{label}</span>
    </div>
  );
}

function severityTone(s: string): "critical" | "error" | "warning" | "info" | "muted" {
  switch (s) {
    case "sev0":
    case "critical": return "critical";
    case "major": return "error";
    case "minor": return "warning";
    default: return "muted";
  }
}
