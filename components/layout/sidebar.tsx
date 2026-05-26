"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn, initialsOf } from "@/lib/utils";
import { PRIMARY_NAV } from "@/lib/nav";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = useAdminAuthStore((s) => s.admin);
  const signOut = useAdminAuthStore((s) => s.signOut);

  const displayName = admin?.fullName ?? admin?.displayName ?? "Super Admin";
  const subLabel = admin?.role ?? "super_admin";
  const avatarText = initialsOf(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <aside className="ds-sidebar">
      <div className="ds-sidebar__brand">
        <Link href="/dashboard" className="ds-sidebar__brand-link" aria-label="KEYRA Global Admin">
          <img
            src="/assets/keyra_logo_hz_white.png"
            alt="KEYRA"
            className="ds-sidebar__brand-logo"
          />
          <span className="sr-only">KEYRA Global Admin</span>
        </Link>
        <div className="ds-sidebar__brand-sub">Global admin</div>
      </div>

      <nav className="ds-sidebar__body">
        {PRIMARY_NAV.map((section) => (
          <div key={section.id}>
            <div className="ds-sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("ds-sidebar-link", active && "is-active")}
                  prefetch
                >
                  <MaterialIcon name={item.icon} size={18} className="ds-sidebar-link__icon" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? <span className="ds-sidebar-link__badge">{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="ds-sidebar-profile">
        <div className="ds-sidebar-profile__card">
          <div className="ds-sidebar-profile__row">
            <div className="ds-sidebar-profile__avatar" aria-hidden>{avatarText}</div>
            <div className="min-w-0 flex-1">
              <div className="ds-sidebar-profile__name truncate">{displayName}</div>
              <div className="ds-sidebar-profile__meta truncate font-mono uppercase tracking-wider">
                {subLabel}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="ds-sidebar-profile__action"
          >
            <MaterialIcon name="logout" size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
