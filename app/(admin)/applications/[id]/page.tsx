import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { MaterialIcon } from "@/components/ui/material-icon";
import { ApplicationProfile } from "@/components/applications/application-profile";
import { getApplication } from "@/features/applications/services/application-service";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) notFound();
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/applications" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1">
              <MaterialIcon name="arrow_back" size={12} /> Applications
            </Link>
            <span>{"// MANIFEST"}</span>
          </>
        }
        title={application.name}
        subtitle={<span className="font-mono">{application.slug}</span>}
      />
      <ApplicationProfile application={application} />
    </>
  );
}
