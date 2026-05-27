"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/lib/nav";
import { MaterialIcon } from "@/components/ui/material-icon";
import { SidebarProfile } from "@/components/layout/sidebar-profile";

export function Sidebar({ forceVisible = false }: { forceVisible?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "ds-sidebar",
        forceVisible ? "ds-sidebar--drawer flex h-full min-h-0" : "hidden lg:sticky lg:top-0 lg:flex lg:h-screen",
      )}
    >
      <div className="ds-sidebar-header">
        <div className="ds-sidebar-brand">
          <Link href="/dashboard" prefetch className="ds-sidebar-brand-link" aria-label="KEYRA Global Admin">
            <Image
              src="/assets/keyra_logo_hz_white.png"
              alt="KEYRA"
              width={200}
              height={48}
              priority
              className="ds-sidebar-brand-logo"
            />
          </Link>
        </div>
      </div>

      <div className="ds-sidebar-body">
        {PRIMARY_NAV.map((section) => (
          <div key={section.id}>
            <p className="ds-sidebar-section-label">{section.label}</p>
            <nav aria-label={section.label}>
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={cn("ds-sidebar-link", active && "is-active")}
                    aria-current={active ? "page" : undefined}
                  >
                    <MaterialIcon name={item.icon} size={20} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge ? <span className="ds-sidebar-link__badge">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <SidebarProfile />
    </aside>
  );
}
