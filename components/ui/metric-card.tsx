import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";
import { MaterialIcon } from "./material-icon";
import { Sparkline } from "./sparkline";

export type MetricStatus = "success" | "warning" | "error" | "info";

export function MetricCard({
  label,
  value,
  format = "number",
  decimals = 0,
  delta,
  deltaSuffix = "vs 24h",
  trend = "flat",
  spark,
  pulse,
  icon,
  suffix,
  prefix,
  className,
}: {
  label: string;
  value: number | null | undefined;
  format?: "number" | "currency" | "percent" | "raw";
  decimals?: number;
  delta?: number | null;
  deltaSuffix?: string;
  trend?: "up" | "down" | "flat";
  spark?: number[];
  pulse?: MetricStatus;
  icon?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const formatDelta = (value: number | null | undefined) => {
    if (value === null || value === undefined) return null;
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className={cn("ds-metric ds-fade-up", className)}>
      <div className="ds-metric__label">
        {icon ? <MaterialIcon name={icon} size={13} className="text-[var(--ds-muted)]" /> : null}
        <span>{label}</span>
      </div>
      <div className="ds-metric__value">
        <AnimatedCounter value={value} format={format} decimals={decimals} prefix={prefix} suffix={suffix} />
      </div>
      {delta !== undefined && delta !== null ? (
        <div
          className={cn(
            "ds-metric__delta",
            trend === "up" && "ds-metric__delta--up",
            trend === "down" && "ds-metric__delta--down",
            trend === "flat" && "ds-metric__delta--flat",
          )}
        >
          <MaterialIcon
            name={trend === "up" ? "trending_up" : trend === "down" ? "trending_down" : "trending_flat"}
            size={13}
          />
          <span>{formatDelta(delta)}</span>
          <span className="text-[var(--ds-muted-soft)]">{deltaSuffix}</span>
        </div>
      ) : null}
      {spark && spark.length > 1 ? <Sparkline data={spark} className="ds-metric__spark" /> : null}
      {pulse ? (
        <span
          className={cn(
            "ds-metric__pulse",
            pulse === "warning" && "ds-metric__pulse--warning",
            pulse === "error" && "ds-metric__pulse--error",
            pulse === "info" && "ds-metric__pulse--info",
          )}
        />
      ) : null}
    </div>
  );
}
