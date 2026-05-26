"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn, initialsOf } from "@/lib/utils";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";
import { useTheme } from "@/contexts/theme-context";

export function Topbar({ mobileSidebarToggle }: { mobileSidebarToggle?: ReactNode }) {
  const router = useRouter();
  const admin = useAdminAuthStore((s) => s.admin);
  const signOut = useAdminAuthStore((s) => s.signOut);
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-admin-profile-menu]")) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const displayName = admin?.fullName ?? admin?.displayName ?? "Super Admin";
  const subLabel = admin?.email ?? admin?.phone ?? "admin.developer.keyra.ie";
  const avatarText = initialsOf(displayName);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="ds-topnav">
      <div className="ds-topnav__inner">
        {mobileSidebarToggle ? <div className="shrink-0 lg:hidden">{mobileSidebarToggle}</div> : null}

        <Link href="/dashboard" className="ds-topnav__crumb" aria-label="KEYRA Global Admin">
          <img
            src="/assets/keyra_logo_hz_black.png"
            alt=""
            className="ds-topnav__crumb-logo ds-topnav__crumb-logo--hz ds-topnav__crumb-logo--light"
          />
          <img
            src="/assets/keyra_logo_hz_white.png"
            alt=""
            className="ds-topnav__crumb-logo ds-topnav__crumb-logo--hz ds-topnav__crumb-logo--dark"
          />
          <span className="ds-topnav__crumb-sep hidden lg:inline">/</span>
          <span className="ds-topnav__crumb-label hidden lg:inline">Global Admin</span>
        </Link>

        <button
          type="button"
          className="ds-quick-jump-trigger mx-auto"
          aria-label="Open global search"
        >
          <MaterialIcon name="search" size={16} />
          <span className="flex-1 truncate">Search developers, orgs, apps, AI agents…</span>
          <span className="ds-quick-jump-trigger__kbd">⌘K</span>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <button type="button" aria-label="Notifications" className="ds-btn-icon relative">
            <MaterialIcon name="notifications" size={20} />
          </button>

          <div className="relative ml-1 pl-2" data-admin-profile-menu>
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-[var(--ds-radius-md)] border border-transparent hover:border-[var(--ds-hairline-strong)] hover:bg-[var(--ds-canvas-soft)] px-2 py-1 transition-colors"
            >
              <div className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-strong)] text-[var(--ds-ink)]">
                {avatarText}
              </div>
              <MaterialIcon name="expand_more" size={14} className="text-[var(--ds-muted)] hidden sm:block" />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="ds-menu absolute right-0 top-full mt-2 w-[260px] z-50"
              >
                <div className="px-2 py-2 border-b border-[var(--ds-hairline)] mb-1">
                  <div className="text-[13px] font-semibold text-[var(--ds-ink)] truncate">
                    {displayName}
                  </div>
                  <div className="text-[11.5px] text-[var(--ds-muted)] truncate">{subLabel}</div>
                  {admin?.role ? (
                    <div className="mt-1 text-[10.5px] font-mono uppercase tracking-wider text-[var(--ds-body)]">
                      {admin.role}
                    </div>
                  ) : null}
                </div>

                <div
                  className="px-2 pt-1 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ds-muted)]"
                >
                  Appearance
                </div>
                <div className="flex gap-1 px-1 pb-1">
                  <ThemeOptionBtn
                    icon="dark_mode"
                    label="Dark"
                    active={theme === "dark"}
                    onClick={() => setTheme("dark")}
                  />
                  <ThemeOptionBtn
                    icon="light_mode"
                    label="Light"
                    active={theme === "light"}
                    onClick={() => setTheme("light")}
                  />
                </div>

                <div className="ds-menu__sep" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="ds-menu__item w-full"
                  data-destructive="true"
                >
                  <MaterialIcon name="logout" size={16} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function ThemeOptionBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--ds-radius-sm)] border px-2 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "border-[var(--ds-ink)] bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]"
          : "border-[var(--ds-hairline)] bg-transparent text-[var(--ds-body)] hover:bg-[var(--ds-canvas-soft)] hover:text-[var(--ds-ink)]"
      )}
    >
      <MaterialIcon name={icon} size={14} />
      {label}
    </button>
  );
}
