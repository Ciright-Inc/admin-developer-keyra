import { ApplicationDetailClient } from "@/components/applications/application-detail-client";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationDetailClient id={id} />;
}
