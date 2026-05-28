import { DeveloperDetailClient } from "@/components/developers/developer-detail-client";

export const dynamic = "force-dynamic";

export default async function DeveloperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeveloperDetailClient id={id} />;
}
