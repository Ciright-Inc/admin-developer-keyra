"use client";

import { cn } from "@/lib/utils";

type SlideToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Inline: label above switch (toolbar fields); default: settings row */
  variant?: "default" | "inline";
  className?: string;
};

export function SlideToggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  variant = "default",
  className,
}: SlideToggleProps) {
  const labelId = `${id}-label`;

  const switchButton = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      disabled={disabled}
      className={cn("ds-slide-toggle", checked && "is-on")}
      onClick={() => onChange(!checked)}
    >
      <span className="ds-slide-toggle__thumb" aria-hidden />
    </button>
  );

  if (variant === "inline") {
    return (
      <div className={cn("ds-slide-toggle-field", className)}>
        <span className="ds-slide-toggle-field__caption">{label}</span>
        <div className="ds-slide-toggle-field__box">
          <label htmlFor={id} id={labelId} className="ds-slide-toggle-field__label">
            {label}
          </label>
          {switchButton}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("ds-settings-toggle-row", className)}>
      <div className="ds-settings-toggle-row__copy">
        <label htmlFor={id} id={labelId} className="ds-settings-toggle-row__label">
          {label}
        </label>
        {description ? <p className="ds-settings-toggle-row__desc">{description}</p> : null}
      </div>
      {switchButton}
    </div>
  );
}
