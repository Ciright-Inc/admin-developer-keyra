import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { OrganizationsTable } from "@/components/organizations/organizations-table";

export const dynamic = "force-dynamic";

export default function OrganizationsPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // ORGANIZATIONS</span>
            <Badge tone="info" dot>LIVE</Badge>
          </>
        }
        title="Global organizations registry"
        subtitle="Every customer organization with developer counts, applications, AI agents, MRR, telecom integrations, security posture and compliance status."
      />
      <OrganizationsTable />
    </>
  );
}
