import { cn } from "@/lib/utils";
import { MaterialIcon } from "./material-icon";

export function Panel({
  title,
  icon,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  flush = false,
  // `glass` is kept for back-compat with existing call sites but has no visual
  // effect now — every panel renders as a solid hairline-bordered card.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glass: _glass = false,
}: {
  title?: React.ReactNode;
  icon?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
  glass?: boolean;
}) {
  return (
    <section className={cn("ds-panel", className)}>
      {title || actions ? (
        <header className="ds-panel__header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="ds-panel__title min-w-0">
              {icon ? <MaterialIcon name={icon} size={14} className="ds-panel__title-icon" /> : null}
              <span className="truncate">{title}</span>
            </div>
            {subtitle ? <span className="ds-panel__sub truncate">{subtitle}</span> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("ds-panel__body", flush && "ds-panel__body--flush", bodyClassName)}>{children}</div>
    </section>
  );
}
