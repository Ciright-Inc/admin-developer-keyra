import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ApplicationsTable } from "@/components/applications/applications-table";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // PROJECTS</span>
            <Badge tone="info" dot>LIVE</Badge>
          </>
        }
        title="Global projects registry"
        subtitle="Every developer project in the KEYRA workspace — across all companies and accounts, with environment, listing status, and API key controls."
      />
      <Suspense fallback={<div className="ds-panel p-8 text-center text-[var(--ds-muted)]">Loading projects…</div>}>
        <ApplicationsTable />
      </Suspense>
    </>
  );
}
