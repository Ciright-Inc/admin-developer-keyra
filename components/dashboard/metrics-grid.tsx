"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/ui/metric-card";
import { getDashboardSnapshot } from "@/features/dashboard/services/dashboard-service";
import { useDashboardStream } from "@/hooks/use-dashboard-stream";
import type { DashboardMetric, DashboardSnapshot } from "@/types/admin";

const SPARK_LIVE_KEYS = new Set([
  "active_rps",
  "active_sessions",
  "trust_verifications_24h",
  "ai_agent_transactions",
  "fraud_events_24h",
  "telecom_nodes_online",
  "sim_verification_requests",
]);

function generateSpark(seed: number, length = 16) {
  const out: number[] = [];
  let v = seed * 0.7 + 10;
  for (let i = 0; i < length; i++) {
    v += (Math.random() - 0.4) * (seed * 0.05 + 4);
    out.push(Math.max(0, v));
  }
  return out;
}

const subscribe = () => () => {};
const useIsMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export function MetricsGrid({ initial }: { initial: DashboardSnapshot | null }) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(initial);
  const mounted = useIsMounted();
  const { tick } = useDashboardStream();

  useEffect(() => {
    if (!snapshot) {
      void getDashboardSnapshot().then(setSnapshot);
    }
  }, [snapshot]);

  const metrics: DashboardMetric[] = useMemo(() => {
    const base = snapshot?.metrics ?? PLACEHOLDER_METRICS;
    if (!tick) return base;
    const liveMap: Record<string, number | undefined> = {
      active_rps: tick.active_rps,
      active_sessions: tick.active_sessions,
      trust_verifications_24h: tick.trust_verifications_24h,
      ai_agent_transactions: tick.ai_agent_transactions,
      fraud_events_24h: tick.fraud_events_24h,
      telecom_nodes_online: tick.nodes_online,
    };
    return base.map((m) => (liveMap[m.id] !== undefined ? { ...m, value: Number(liveMap[m.id]) } : m));
  }, [snapshot, tick]);

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
      }}
    >
      {metrics.map((m, idx) => (
        <motion.div
          key={m.id}
          variants={{
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <MetricCard
            label={m.label}
            value={m.value}
            format={m.format}
            decimals={m.decimals ?? 0}
            delta={m.delta}
            trend={m.trend}
            icon={m.icon}
            pulse={m.pulse}
            spark={mounted && SPARK_LIVE_KEYS.has(m.id) ? generateSpark(m.value + idx) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Skeleton metrics shown when backend is unreachable — kept identical shape so the UI doesn't shift.
const PLACEHOLDER_METRICS: DashboardMetric[] = [
  { id: "total_developers", label: "Total developers", value: 0, icon: "groups", format: "number" },
  { id: "active_developers", label: "Active developers (30d)", value: 0, icon: "trending_up", format: "number" },
  { id: "total_organizations", label: "Total organizations", value: 0, icon: "domain", format: "number" },
  { id: "total_applications", label: "Total applications", value: 0, icon: "deployed_code", format: "number" },
  { id: "applications_pending_approval", label: "Applications pending", value: 0, icon: "pending", format: "number", pulse: "warning" },
  { id: "active_rps", label: "Active API calls", value: 0, icon: "bolt", format: "number", pulse: "info" },
  { id: "trust_verifications_24h", label: "Trust verifications (24h)", value: 0, icon: "verified_user", format: "number" },
  { id: "human_verification_success_rate", label: "Human verification success", value: 0, icon: "task_alt", format: "percent", decimals: 1 },
  { id: "ai_agent_transactions", label: "AI agents active", value: 0, icon: "smart_toy", format: "number" },
  { id: "revenue_today", label: "Revenue today", value: 0, icon: "payments", format: "currency" },
  { id: "mrr", label: "Monthly recurring revenue", value: 0, icon: "trending_up", format: "currency" },
  { id: "country_adoption_index", label: "Countries with adoption", value: 0, icon: "public", format: "number" },
  { id: "global_infrastructure_health", label: "Global infra health", value: 0, icon: "device_hub", format: "percent", decimals: 1 },
  { id: "sdk_installs", label: "Global SDK installs", value: 0, icon: "package_2", format: "number" },
  { id: "active_sessions", label: "Active OAuth sessions", value: 0, icon: "lock_open", format: "number" },
  { id: "sim_verification_requests", label: "SIM verification (24h)", value: 0, icon: "sim_card", format: "number" },
  { id: "api_failure_rate", label: "API failure rate", value: 0, icon: "error", format: "percent", decimals: 2, pulse: "info" },
  { id: "fraud_events_24h", label: "Fraud detection events", value: 0, icon: "gpp_bad", format: "number", pulse: "warning" },
  { id: "compliance_escalations", label: "Open compliance escalations", value: 0, icon: "report", format: "number" },
  { id: "telecom_nodes_online", label: "Telecom nodes online", value: 0, icon: "cell_tower", format: "number" },
];
