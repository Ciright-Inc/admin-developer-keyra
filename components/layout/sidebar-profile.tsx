"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAdminAuthStore } from "@/hooks/use-admin-auth-store";
import { initialsOf } from "@/lib/utils";

export function SidebarProfile() {
  const router = useRouter();
  const admin = useAdminAuthStore((s) => s.admin);
  const signOut = useAdminAuthStore((s) => s.signOut);

  const displayName = admin?.fullName ?? admin?.displayName ?? "Super Admin";
  const subtitle = admin?.role ?? "super_admin";
  const avatarText = initialsOf(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="ds-sidebar-profile">
      <div className="ds-sidebar-profile__card">
        <div className="ds-sidebar-profile__main">
          <div className="ds-sidebar-profile__avatar" aria-hidden>
            {avatarText}
          </div>
          <div className="ds-sidebar-profile__info">
            <p className="ds-sidebar-profile__name">{displayName}</p>
            <p className="ds-sidebar-profile__meta font-mono uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        <button type="button" className="ds-sidebar-profile__action" onClick={() => void handleSignOut()}>
          <MaterialIcon name="logout" size={15} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
