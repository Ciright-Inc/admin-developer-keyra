"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import type { SdkCatalogue } from "@/types/admin";

interface Props {
  sdk: SdkCatalogue;
  onEdit: (sdk: SdkCatalogue) => void;
  onDeprecate: (id: string) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}

export function SdkRowActions({ sdk, onEdit, onDeprecate, onDelete, busy }: Props) {
  const router = useRouter();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="icon" variant="ghost" aria-label="Open SDK actions" disabled={busy}>
          <MaterialIcon name="more_horiz" size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="ds-menu" sideOffset={6} align="end">
          <DropdownMenu.Item className="ds-menu__item" onSelect={() => onEdit(sdk)}>
            <MaterialIcon name="edit" size={14} />
            <span>Edit</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="ds-menu__item"
            onSelect={() => router.push(`/sdks/${sdk.id}`)}
          >
            <MaterialIcon name="history" size={14} />
            <span>Versions</span>
          </DropdownMenu.Item>
          {sdk.status !== "deprecated" ? (
            <>
              <DropdownMenu.Separator className="ds-menu__sep" />
              <DropdownMenu.Item
                className="ds-menu__item"
                data-destructive="true"
                onSelect={() => onDeprecate(sdk.id)}
              >
                <MaterialIcon name="block" size={14} />
                <span>Deprecate</span>
              </DropdownMenu.Item>
            </>
          ) : null}
          <DropdownMenu.Separator className="ds-menu__sep" />
          <DropdownMenu.Item
            className="ds-menu__item"
            data-destructive="true"
            onSelect={() => onDelete(sdk.id)}
          >
            <MaterialIcon name="delete" size={14} />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
