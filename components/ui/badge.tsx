import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "error" | "info" | "critical" | "muted" | "accent";

export function Badge({
  children,
  tone = "muted",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("ds-badge-pill", `ds-badge--${tone}`, className)}>
      {dot ? <span className="ds-dot" /> : null}
      {children}
    </span>
  );
}
