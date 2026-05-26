"use client";

import { useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { DashboardStreamTick } from "@/types/admin";
import { cn } from "@/lib/utils";

export function TelemetryStrip({ tick }: { tick: DashboardStreamTick | null }) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNowMs(Date.now());
    const t = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);
  const agoSeconds = tick && nowMs ? Math.round((nowMs - tick.ts) / 1000) : null;
  const items: {
    label: string;
    value: number | null;
    icon: string;
    format?: "number" | "currency";
    compact?: boolean;
    tone?: "success" | "warning" | "info" | "error";
  }[] = [
    { label: "Active RPS", value: tick?.active_rps ?? null, icon: "bolt", compact: true, tone: "info" },
    { label: "Active sessions", value: tick?.active_sessions ?? null, icon: "lock_open", compact: true, tone: "info" },
    { label: "Trust verifications (24h)", value: tick?.trust_verifications_24h ?? null, icon: "verified_user", compact: true, tone: "success" },
    { label: "AI agent transactions", value: Math.round(tick?.ai_agent_transactions ?? 0) || null, icon: "smart_toy", compact: true, tone: "info" },
    { label: "Fraud events (24h)", value: tick?.fraud_events_24h ?? null, icon: "gpp_bad", compact: true, tone: "warning" },
    { label: "Telecom nodes online", value: tick?.nodes_online ?? null, icon: "cell_tower", compact: true, tone: "success" },
  ];

  return (
    <div className="ds-telemetry-strip ds-fade-up">
      {items.map((item) => (
        <div key={item.label} className="ds-telemetry-strip__item">
          <span className="ds-telemetry-strip__label flex items-center gap-1.5">
            <MaterialIcon name={item.icon} size={11} className={cn(toneColor(item.tone))} />
            {item.label}
          </span>
          <span className="ds-telemetry-strip__value">
            <AnimatedCounter value={item.value} compact={item.compact} format={item.format ?? "number"} />
          </span>
        </div>
      ))}
      <div className="ds-telemetry-strip__item ml-auto">
        <span className="ds-telemetry-strip__label flex items-center gap-1.5">
          <span className="ds-dot text-[var(--ds-success)]" />
          Live · {tick ? (agoSeconds === null ? "now" : `${agoSeconds}s ago`) : "connecting"}
        </span>
        <span className="ds-telemetry-strip__value text-[var(--ds-muted)] text-[12px]">SSE · /admin/global/dashboard/stream</span>
      </div>
    </div>
  );
}

function toneColor(tone?: "success" | "warning" | "info" | "error") {
  switch (tone) {
    case "success": return "text-[var(--ds-success)]";
    case "warning": return "text-[var(--ds-warning)]";
    case "error": return "text-[var(--ds-error)]";
    default: return "text-[var(--ds-text-link)]";
  }
}
