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
            <span>SECTION // APPLICATIONS</span>
            <Badge tone="info" dot>LIVE</Badge>
          </>
        }
        title="Global application catalogue"
        subtitle="Every iOS, Android, Web, AI Agent, API, Enterprise SaaS, Metaverse, Telecom, Government, Medical, Financial, Gaming and Autonomous app that depends on KEYRA — with revocation controls."
      />
      <ApplicationsTable />
    </>
  );
}
