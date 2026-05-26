import { MaterialIcon } from "./material-icon";
import { Badge } from "./badge";

export function ComingSoon({
  icon,
  label,
  description,
  phase,
}: {
  icon: string;
  label: string;
  description?: string;
  phase?: string;
}) {
  return (
    <div className="ds-panel ds-fade-up overflow-hidden">
      <div className="p-10 flex flex-col items-start gap-4">
        <div className="w-12 h-12 rounded-[var(--ds-radius-md)] grid place-items-center shrink-0 bg-[var(--ds-surface-strong)] border border-[var(--ds-hairline-strong)]">
          <MaterialIcon name={icon} size={24} className="text-[var(--ds-ink)]" />
        </div>
        <div>
          <div className="ds-page__eyebrow mb-2">{phase ?? "On the roadmap"}</div>
          <h2 className="text-2xl font-semibold text-[var(--ds-ink)] mb-2 tracking-tight">{label}</h2>
          {description ? (
            <p className="text-[var(--ds-body)] text-[14px] max-w-2xl leading-relaxed">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="info">Scaffolded</Badge>
          <Badge tone="muted">Mock data forthcoming</Badge>
        </div>
      </div>
    </div>
  );
}
