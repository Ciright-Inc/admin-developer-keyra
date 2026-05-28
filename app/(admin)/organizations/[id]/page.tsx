import { OrganizationDetailClient } from "@/components/organizations/organization-detail-client";

export const dynamic = "force-dynamic";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationDetailClient id={id} />;
}
