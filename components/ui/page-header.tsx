import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("ds-page__header ds-fade-up", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="ds-page__eyebrow">
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h1 className="ds-page__title">{title}</h1>
        {subtitle ? <p className="ds-page__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </header>
  );
}
