import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { PageHeader } from "@/components/ui/page-header";
import { DeveloperProfileHeader } from "@/components/developers/developer-profile-header";
import { DeveloperProfileTabs } from "@/components/developers/developer-profile-tabs";
import { getDeveloper } from "@/features/developers/services/developer-service";

export const dynamic = "force-dynamic";

export default async function DeveloperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const developer = await getDeveloper(id);
  if (!developer) {
    notFound();
  }
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/developers" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1">
              <MaterialIcon name="arrow_back" size={12} /> Developers
            </Link>
            <span>{"// PROFILE"}</span>
          </>
        }
        title={developer.display_name || "Developer profile"}
        subtitle={
          <span>
            Subscription <span className="text-[var(--keyra-accent)] font-mono">{developer.subscription_hash || "—"}</span> · KEYRA ID <span className="font-mono">{developer.id.slice(0, 8)}</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost"><MaterialIcon name="open_in_new" size={14} /> Open in support</Button>
            <Button variant="accent"><MaterialIcon name="login" size={14} /> Impersonate</Button>
          </div>
        }
      />
      <div className="flex flex-col gap-4">
        <DeveloperProfileHeader developer={developer} />
        <DeveloperProfileTabs developer={developer} />
      </div>
    </>
  );
}
