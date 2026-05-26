"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";

export function AnimatedCounter({
  value,
  format = "number",
  compact = true,
  decimals = 0,
  currency = "USD",
  durationMs = 700,
  suffix,
  prefix,
}: {
  value: number | null | undefined;
  format?: "number" | "currency" | "percent" | "raw";
  compact?: boolean;
  decimals?: number;
  currency?: string;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(value ?? 0);
  const previous = useRef(value ?? 0);
  const startedAt = useRef<number | null>(null);
  const target = value ?? 0;

  useEffect(() => {
    const start = previous.current;
    if (start === target) return;
    startedAt.current = performance.now();
    let frame = 0;
    const tick = () => {
      const t = startedAt.current ? Math.min(1, (performance.now() - startedAt.current) / durationMs) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const next = start + (target - start) * eased;
      setDisplay(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        previous.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  if (value === null || value === undefined) return <span className="ds-tabular">—</span>;

  let formatted: string;
  if (format === "currency") {
    formatted = formatCurrency(display, currency, { compact });
  } else if (format === "percent") {
    formatted = formatPercent(display, decimals);
  } else if (format === "raw") {
    formatted = display.toFixed(decimals);
  } else {
    formatted = formatNumber(display, { compact, decimals });
  }

  return (
    <span className="ds-tabular" suppressHydrationWarning>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
