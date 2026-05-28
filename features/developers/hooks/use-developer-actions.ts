"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  escalateDeveloper,
  impersonateDeveloper,
  messageDeveloper,
  resetDeveloperApiKeys,
  suspendDeveloper,
  verifyDeveloper,
} from "@/features/developers/services/developer-service";
import type { Developer } from "@/types/admin";

export function useDeveloperActions(developer: Developer, onChanged?: () => void) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const canAct = developer.has_developer_account !== false && !String(developer.id).startsWith("user-");
  const disabledReason = canAct ? undefined : "No workspace yet";

  const run = async (label: string, fn: () => Promise<void>) => {
    if (!canAct) {
      toast.error(disabledReason);
      return;
    }
    setBusy(true);
    try {
      await fn();
      toast.success(`${label} — ${developer.display_name}`);
      onChanged?.();
      router.refresh();
    } catch (err) {
      toast.error(`${label} failed: ${(err as Error)?.message ?? "unknown error"}`);
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    canAct,
    disabledReason,
    verify: () => run("Verified", () => verifyDeveloper(developer.id)),
    suspend: (reason?: string) => run("Suspended", () => suspendDeveloper(developer.id, reason)),
    escalate: (reason?: string) => run("Escalated", () => escalateDeveloper(developer.id, reason, "medium")),
    resetApiKeys: () => run("API keys revoked", () => resetDeveloperApiKeys(developer.id)),
    impersonate: async () => {
      if (!canAct) {
        toast.error(disabledReason);
        return;
      }
      setBusy(true);
      try {
        const { redirectUrl } = await impersonateDeveloper(developer.id);
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        toast.success(`Impersonation link opened for ${developer.display_name}`);
      } catch (err) {
        toast.error(`Impersonate failed: ${(err as Error)?.message ?? "unknown error"}`);
      } finally {
        setBusy(false);
      }
    },
    message: async (title: string, body: string) => {
      if (!canAct) {
        toast.error(disabledReason);
        return;
      }
      setBusy(true);
      try {
        await messageDeveloper(developer.id, { title, body });
        toast.success(`Message sent to ${developer.display_name}`);
        onChanged?.();
      } catch (err) {
        toast.error(`Message failed: ${(err as Error)?.message ?? "unknown error"}`);
      } finally {
        setBusy(false);
      }
    },
    openSupport: () => {
      const email = developer.professional_email || "";
      const subject = encodeURIComponent(`KEYRA support — ${developer.display_name || developer.id}`);
      const body = encodeURIComponent(`Developer ID: ${developer.id}\n`);
      window.location.href = email ? `mailto:${email}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`;
    },
  };
}
