"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import { useDeveloperActions } from "@/features/developers/hooks/use-developer-actions";
import type { Developer } from "@/types/admin";

interface Props {
  developer: Developer;
  onChanged?: () => void;
}

export function DeveloperRowActions({ developer, onChanged }: Props) {
  const actions = useDeveloperActions(developer, onChanged);
  const busy = actions.busy;
  const disabled = !actions.canAct;
  const disabledTitle = actions.disabledReason;

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
          <Item icon="verified_user" label="Verify" disabled={disabled} title={disabledTitle} onSelect={() => void actions.verify()} />
          <Item icon="report" label="Escalate" disabled={disabled} title={disabledTitle} onSelect={() => void actions.escalate("Manual review")} />
          <Item icon="vpn_key_off" label="Reset API keys" destructive disabled={disabled} title={disabledTitle} onSelect={() => void actions.resetApiKeys()} />
          <DropdownMenu.Separator className="ds-menu__sep" />
          <Item icon="block" label="Suspend developer" destructive disabled={disabled} title={disabledTitle} onSelect={() => void actions.suspend("Super-admin manual")} />
          <DropdownMenu.Separator className="ds-menu__sep" />
          <Item icon="login" label="Impersonate" disabled={disabled} title={disabledTitle} onSelect={() => void actions.impersonate()} />
          <Item icon="forum" label="Send message" href={`/developers/${developer.id}`} />
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
  title,
}: {
  icon: string;
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <DropdownMenu.Item
      title={title}
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
