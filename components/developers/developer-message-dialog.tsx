"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

export function DeveloperMessageDialog({
  open,
  onOpenChange,
  onSend,
  busy,
  developerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (title: string, body: string) => void;
  busy?: boolean;
  developerName?: string;
}) {
  const [title, setTitle] = React.useState("Message from KEYRA Admin");
  const [body, setBody] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setTitle("Message from KEYRA Admin");
      setBody("");
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ds-dialog-overlay" />
        <Dialog.Content className="ds-dialog">
          <Dialog.Title className="text-[15px] font-semibold text-[var(--ds-ink)]">
            Send message{developerName ? ` to ${developerName}` : ""}
          </Dialog.Title>
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-[var(--ds-muted)]">Title</span>
              <input className="ds-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-[12px]">
              <span className="text-[var(--ds-muted)]">Message</span>
              <textarea
                className="ds-input min-h-[120px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message…"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="accent"
              disabled={busy || !body.trim()}
              onClick={() => onSend(title.trim(), body.trim())}
            >
              <MaterialIcon name="send" size={14} /> Send
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
