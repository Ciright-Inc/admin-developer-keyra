import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, options?: { compact?: boolean; decimals?: number }) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: options.decimals ?? 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(value);
}

export function formatCurrency(value: number | null | undefined, currency = "USD", options?: { compact?: boolean }) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatRelativeTime(iso: string | Date | null | undefined) {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return `${yr}y ago`;
}

export function formatDate(iso: string | Date | null | undefined) {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function trustScoreTier(score: number | null | undefined): "critical" | "low" | "medium" | "high" | "excellent" {
  if (score === null || score === undefined) return "low";
  if (score >= 90) return "excellent";
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  if (score >= 25) return "low";
  return "critical";
}

export function trustScoreColor(score: number | null | undefined): string {
  const tier = trustScoreTier(score);
  switch (tier) {
    case "excellent":
      return "var(--trust-100)";
    case "high":
      return "var(--trust-75)";
    case "medium":
      return "var(--trust-50)";
    case "low":
      return "var(--trust-25)";
    case "critical":
    default:
      return "var(--trust-0)";
  }
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function shortHash(value: string | null | undefined, length = 8) {
  if (!value) return "—";
  return value.slice(0, length);
}
