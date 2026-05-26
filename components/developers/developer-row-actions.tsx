"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import {
  resetDeveloperApiKeys,
  suspendDeveloper,
  verifyDeveloper,
  escalateDeveloper,
} from "@/features/developers/services/developer-service";
import type { Developer } from "@/types/admin";

interface Props {
  developer: Developer;
  onChanged?: () => void;
}

export function DeveloperRowActions({ developer, onChanged }: Props) {
  const [busy, setBusy] = React.useState(false);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(`${label} — ${developer.display_name}`);
      onChanged?.();
    } catch (err) {
      toast.error(`${label} failed: ${(err as Error)?.message ?? "unknown error"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open actions" disabled={busy}>
          <MaterialIcon name="more_horiz" size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="ds-menu" sideOffset={6} align="end">
          <Item icon="visibility" label="View profile" href={`/developers/${developer.id}`} />
          <DropdownMenu.Separator className="ds-menu__sep" />
          <Item icon="verified_user" label="Verify" onSelect={() => run("Verified", () => verifyDeveloper(developer.id))} />
          <Item icon="report" label="Escalate" onSelect={() => run("Escalated", () => escalateDeveloper(developer.id, "Manual review", "medium"))} />
          <Item icon="vpn_key_off" label="Reset API keys" destructive onSelect={() => run("API keys revoked", () => resetDeveloperApiKeys(developer.id))} />
          <DropdownMenu.Separator className="ds-menu__sep" />
          <Item icon="block" label="Suspend developer" destructive onSelect={() => run("Suspended", () => suspendDeveloper(developer.id, "Super-admin manual"))} />
          <DropdownMenu.Separator className="ds-menu__sep" />
          <Item icon="forum" label="Send message" disabled />
          <Item icon="account_tree" label="View dependencies" disabled />
          <Item icon="payments" label="View billing" disabled />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  icon,
  label,
  onSelect,
  href,
  destructive,
  disabled,
}: {
  icon: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (href) {
          e.preventDefault();
          window.location.href = href;
          return;
        }
        onSelect?.();
      }}
      data-destructive={destructive ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className="ds-menu__item"
    >
      <MaterialIcon name={icon} size={14} />
      <span>{label}</span>
    </DropdownMenu.Item>
  );
}
