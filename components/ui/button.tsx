import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "tertiary" | "accent" | "danger";
type Size = "default" | "sm" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "outline", size = "default", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "ds-btn",
        variant === "primary" && "ds-btn--primary",
        variant === "outline" && "ds-btn--outline",
        variant === "ghost" && "ds-btn--ghost",
        variant === "tertiary" && "ds-btn--tertiary",
        variant === "accent" && "ds-btn--primary",
        variant === "danger" && "ds-btn--danger",
        size === "sm" && "ds-btn--sm",
        size === "icon" && "ds-btn--icon",
        className,
      )}
      {...rest}
    />
  );
});
