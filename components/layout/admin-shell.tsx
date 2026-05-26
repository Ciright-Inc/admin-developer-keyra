"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SiteFooter } from "./site-footer";
import { MaterialIcon } from "@/components/ui/material-icon";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("[data-app-main]");
    if (!main) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    main.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [pathname]);

  return (
    <div className="ds-app-shell flex h-screen overflow-hidden bg-[var(--ds-canvas-soft)]" data-surface="dashboard">
      <a href="#main-content" className="ds-skip-link">Skip to main content</a>

      <div className="ds-app-shell__sidebar-rail hidden h-screen shrink-0 overflow-x-hidden overflow-y-auto sticky top-0 lg:block">
        <Sidebar />
      </div>

      {open ? (
        <div className="ds-app-shell__mobile-drawer fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />
          <button
            type="button"
            aria-label="Close sidebar"
            className="ds-app-shell__mobile-drawer-close"
            onClick={() => setOpen(false)}
          >
            <MaterialIcon name="close" size={20} />
          </button>
          <aside className="ds-app-shell__mobile-drawer-panel absolute left-0 top-0 flex w-[260px] max-w-[85vw] flex-col">
            <Sidebar />
          </aside>
        </div>
      ) : null}

      <div className="ds-app-shell__main flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[var(--ds-canvas-soft)]">
        <Topbar
          mobileSidebarToggle={
            <button
              type="button"
              aria-label="Open sidebar"
              className="ds-btn-icon lg:hidden"
              onClick={() => setOpen(true)}
            >
              <MaterialIcon name="menu" size={20} />
            </button>
          }
        />
        <main
          id="main-content"
          data-app-main
          className="w-full flex-1 overflow-x-hidden bg-[var(--ds-canvas-soft)]"
          tabIndex={-1}
        >
          <div className="ds-page">{children}</div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
