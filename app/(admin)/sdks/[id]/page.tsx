import { SdkDetailClient } from "@/components/sdks/sdk-detail-client";

export const dynamic = "force-dynamic";

export default async function SdkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SdkDetailClient id={id} />;
}
