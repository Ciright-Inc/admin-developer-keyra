"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { PageHeader } from "@/components/ui/page-header";
import { MaterialIcon } from "@/components/ui/material-icon";
import { ApplicationProfile } from "@/components/applications/application-profile";
import { getApplication } from "@/features/applications/services/application-service";

export function ApplicationDetailClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/applications/${id}`,
    async () => {
      const a = await getApplication(id);
      if (!a) throw new Error("not_found");
      return a;
    },
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-muted)]">
        <MaterialIcon name="hourglass" size={18} /> Loading project…
      </div>
    );
  }

  if (error) {
    if ((error as Error).message === "not_found") {
      return (
        <div className="ds-panel p-12 text-center">
          <div className="text-[15px] text-[var(--ds-ink)]">Project not found</div>
          <Link href="/applications" className="mt-3 inline-flex text-[var(--keyra-accent)] text-[13px]">
            Back to projects
          </Link>
        </div>
      );
    }
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-error)]">
        Failed to load.{" "}
        <button type="button" className="underline" onClick={() => void mutate()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/applications" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1">
              <MaterialIcon name="arrow_back" size={12} /> Projects
            </Link>
            <span>{"// MANIFEST"}</span>
          </>
        }
        title={data.name}
        subtitle={<span className="font-mono">{data.slug}</span>}
      />
      <ApplicationProfile application={data} onChanged={() => void mutate()} />
    </>
  );
}
