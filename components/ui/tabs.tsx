"use client";

import * as React from "react";
import * as RT from "@radix-ui/react-tabs";
import { MaterialIcon } from "./material-icon";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: string;
  badge?: React.ReactNode;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RT.Root
      className={cn("flex flex-col gap-3", className)}
      defaultValue={defaultValue ?? items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <RT.List className="ds-tabs__list">
        {items.map((it) => (
          <RT.Trigger key={it.value} value={it.value} className="ds-tabs__trigger">
            {it.icon ? <MaterialIcon name={it.icon} size={14} /> : null}
            <span>{it.label}</span>
            {it.badge ? <span className="ml-1">{it.badge}</span> : null}
          </RT.Trigger>
        ))}
      </RT.List>
      {children}
    </RT.Root>
  );
}

export const TabPanel = RT.Content;
