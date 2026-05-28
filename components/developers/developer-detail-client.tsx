"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageHeader } from "@/components/ui/page-header";
import { DeveloperProfileHeader } from "@/components/developers/developer-profile-header";
import { DeveloperProfileTabs } from "@/components/developers/developer-profile-tabs";
import { DeveloperMessageDialog } from "@/components/developers/developer-message-dialog";
import { useDeveloperActions } from "@/features/developers/hooks/use-developer-actions";
import { getDeveloper } from "@/features/developers/services/developer-service";
export function DeveloperDetailClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/developers/${id}`,
    async () => {
      const d = await getDeveloper(id);
      if (!d) throw new Error("not_found");
      return d;
    },
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-muted)]">
        <MaterialIcon name="hourglass" size={18} /> Loading developer…
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    if (msg === "not_found") {
      return (
        <div className="ds-panel p-12 text-center">
          <div className="text-[15px] text-[var(--ds-ink)]">Developer not found</div>
          <Link href="/developers" className="mt-3 inline-flex text-[var(--keyra-accent)] text-[13px]">
            Back to developers
          </Link>
        </div>
      );
    }
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-error)]">
        Failed to load developer.{" "}
        <button type="button" className="underline" onClick={() => void mutate()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return <DeveloperDetailView developer={data} onChanged={() => void mutate()} />;
}

function DeveloperDetailView({
  developer,
  onChanged,
}: {
  developer: NonNullable<Awaited<ReturnType<typeof getDeveloper>>>;
  onChanged: () => void;
}) {
  const actions = useDeveloperActions(developer, onChanged);
  const [messageOpen, setMessageOpen] = React.useState(false);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/developers" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1">
              <MaterialIcon name="arrow_back" size={12} /> Developers
            </Link>
            <span>{"// PROFILE"}</span>
          </>
        }
        title={developer.display_name || "Developer profile"}
        subtitle={
          <span>
            Subscription{" "}
            <span className="text-[var(--keyra-accent)] font-mono">{developer.subscription_hash || "—"}</span> · KEYRA ID{" "}
            <span className="font-mono">{developer.id.slice(0, 8)}</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled={actions.busy} onClick={actions.openSupport} title={actions.disabledReason}>
              <MaterialIcon name="open_in_new" size={14} /> Open in support
            </Button>
            <Button
              variant="accent"
              disabled={actions.busy || !actions.canAct}
              title={actions.disabledReason}
              onClick={() => void actions.impersonate()}
            >
              <MaterialIcon name="login" size={14} /> Impersonate
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4">
        <DeveloperProfileHeader
          developer={developer}
          actions={actions}
          onMessage={() => setMessageOpen(true)}
        />
        <DeveloperProfileTabs developer={developer} />
      </div>
      <DeveloperMessageDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        busy={actions.busy}
        developerName={developer.display_name}
        onSend={async (title, body) => {
          await actions.message(title, body);
          setMessageOpen(false);
        }}
      />
    </>
  );
}
