import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DevelopersTable } from "@/components/developers/developers-table";

export const dynamic = "force-dynamic";

export default function DevelopersPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // DEVELOPERS</span>
            <Badge tone="info" dot>LIVE</Badge>
          </>
        }
        title="Global developer registry"
        subtitle="Every developer in the KEYRA ecosystem — sortable, filterable, with the full identity, trust, telecom, AI, fraud, compliance and lifecycle context per row."
      />
      <DevelopersTable />
    </>
  );
}
