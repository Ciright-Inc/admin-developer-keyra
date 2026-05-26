import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { OrganizationProfileTabs } from "@/components/organizations/organization-profile-tabs";
import { getOrganization } from "@/features/organizations/services/organization-service";
import { formatCurrency, formatNumber, initialsOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganization(id);
  if (!org) notFound();
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Link href="/organizations" className="text-[var(--ds-muted)] hover:text-[var(--keyra-accent)] inline-flex items-center gap-1">
              <MaterialIcon name="arrow_back" size={12} /> Organizations
            </Link>
            <span>{"// PROFILE"}</span>
          </>
        }
        title={org.name}
        subtitle={
          <span>
            <span className="font-mono">{org.slug}</span> · <Badge tone="muted">{org.country_iso2 ?? "—"}</Badge> · <Badge tone="muted">{org.industry_slug?.replace(/_/g, " ") ?? "—"}</Badge>
          </span>
        }
        actions={
          <Button variant="ghost"><MaterialIcon name="open_in_new" size={14} /> Open in CRM</Button>
        }
      />
      <div className="flex flex-col gap-4">
        <section className="ds-profile-header items-stretch xl:items-center justify-between gap-6 flex-col xl:flex-row">
          <div className="flex items-center gap-4 min-w-0">
            <div className="ds-avatar">{initialsOf(org.name)}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="accent">{org.enterprise_tier.toUpperCase()}</Badge>
                <StatusPill value={org.status} />
                <Badge tone="muted">REVENUE {org.revenue_tier.toUpperCase()}</Badge>
                <StatusPill value={org.compliance_level} />
              </div>
              <div className="mt-2 text-[12.5px] text-[var(--ds-muted)]">
                {org.region || "—"} · {org.city || "—"} · {org.website ?? ""}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            <Stat label="MRR" value={formatCurrency(Number(org.monthly_recurring_revenue_usd), "USD", { compact: true })} />
            <Stat label="Developers" value={formatNumber(org.developer_count)} />
            <Stat label="Applications" value={formatNumber(org.application_count)} />
            <Stat label="AI agents" value={formatNumber(org.ai_agent_count)} />
            <Stat label="Verif. rating" value={org.verification_rating} />
            <Stat label="Security score" value={<Badge tone={org.security_score > 80 ? "success" : "warning"}>{org.security_score}</Badge>} />
            <Stat label="Risk score" value={<Badge tone={org.operational_risk_score > 60 ? "critical" : "muted"}>{org.operational_risk_score}</Badge>} />
            <Stat label="Telecom" value={<StatusPill value={org.telecom_integration_status} />} />
          </div>
        </section>
        <OrganizationProfileTabs organization={org} />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="ds-stat-pair">
      <span className="ds-stat-pair__label">{label}</span>
      <span className="ds-stat-pair__value">{value}</span>
    </div>
  );
}
