import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_TONE_MAP: Record<string, "success" | "warning" | "error" | "critical" | "info" | "muted" | "accent"> = {
  active: "success",
  verified: "success",
  online: "success",
  enhanced: "success",
  attested: "success",
  resolved: "success",
  success: "success",
  approved: "success",
  ok: "success",

  pending: "warning",
  in_progress: "warning",
  investigating: "warning",
  mitigating: "warning",
  monitoring: "warning",
  scheduled: "warning",
  pilot: "warning",
  trialing: "warning",
  dormant: "warning",
  renewal_due: "warning",
  failure: "warning",
  degraded: "warning",

  suspended: "error",
  rejected: "error",
  failed: "error",
  banned: "error",
  open: "error",
  offline: "error",
  critical: "critical",
  sev0: "critical",
  major: "error",

  baseline: "muted",
  not_started: "muted",
  unverified: "muted",
  inactive: "muted",
  archived: "muted",
  draft: "muted",

  regulated: "accent",
  sovereign: "accent",
  enterprise: "accent",
  strategic: "accent",
  escalated: "accent",
};

export function StatusPill({ value, className }: { value?: string | null; className?: string }) {
  const v = String(value ?? "").trim();
  if (!v) return <span className={cn("text-[11.5px] text-[var(--ds-muted)]", className)}>—</span>;
  const tone = STATUS_TONE_MAP[v.toLowerCase()] ?? "info";
  return (
    <Badge tone={tone} className={className} dot={tone === "success" || tone === "warning" || tone === "error" || tone === "critical"}>
      {v.replace(/_/g, " ")}
    </Badge>
  );
}
