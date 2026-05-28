"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type CreateDrawerProps = {
  open: boolean;
  onClose: () => void;
  disableBackdropClose?: boolean;
  disableEscapeClose?: boolean;
  ariaLabelledBy: string;
  children: ReactNode;
};

export function CreateDrawer({
  open,
  onClose,
  disableBackdropClose = false,
  disableEscapeClose = false,
  ariaLabelledBy,
  children,
}: CreateDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || disableEscapeClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, disableEscapeClose, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="ds-create-drawer" role="presentation">
      <div
        className="ds-create-drawer__backdrop"
        aria-hidden
        onClick={() => {
          if (!disableBackdropClose) onClose();
        }}
      />
      <aside
        className="ds-create-drawer__panel animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </aside>
    </div>,
    document.body,
  );
}
