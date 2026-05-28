"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { OrganizationProfileTabs } from "@/components/organizations/organization-profile-tabs";
import { getOrganization, getOrganizationCrmLink } from "@/features/organizations/services/organization-service";
import { formatCurrency, formatNumber, initialsOf } from "@/lib/utils";

export function OrganizationDetailClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/organizations/${id}`,
    async () => {
      const o = await getOrganization(id);
      if (!o) throw new Error("not_found");
      return o;
    },
    { revalidateOnFocus: false },
  );

  if (isLoading) {
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-muted)]">
        <MaterialIcon name="hourglass" size={18} /> Loading organization…
      </div>
    );
  }

  if (error) {
    if ((error as Error).message === "not_found") {
      return (
        <div className="ds-panel p-12 text-center">
          <div className="text-[15px] text-[var(--ds-ink)]">Organization not found</div>
          <Link href="/organizations" className="mt-3 inline-flex text-[var(--keyra-accent)] text-[13px]">
            Back to organizations
          </Link>
        </div>
      );
    }
    return (
      <div className="ds-panel p-12 text-center text-[var(--ds-error)]">
        Failed to load.{" "}
        <button type="button" className="underline" onClick={() => void mutate()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const openCrm = async () => {
    try {
      const { url } = await getOrganizationCrmLink(data.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(`CRM link failed: ${(e as Error).message}`);
    }
  };

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
        title={data.name}
        subtitle={
          <span>
            <span className="font-mono">{data.slug}</span> · <Badge tone="muted">{data.country_iso2 ?? "—"}</Badge> ·{" "}
            <Badge tone="muted">{data.industry_slug?.replace(/_/g, " ") ?? "—"}</Badge>
          </span>
        }
        actions={
          <Button variant="ghost" onClick={() => void openCrm()}>
            <MaterialIcon name="open_in_new" size={14} /> Open in CRM
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <section className="ds-profile-header items-stretch xl:items-center justify-between gap-6 flex-col xl:flex-row">
          <div className="flex items-center gap-4 min-w-0">
            <div className="ds-avatar">{initialsOf(data.name)}</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="accent">{data.enterprise_tier.toUpperCase()}</Badge>
                <StatusPill value={data.status} />
                <Badge tone="muted">REVENUE {data.revenue_tier.toUpperCase()}</Badge>
                <StatusPill value={data.compliance_level} />
              </div>
              <div className="mt-2 text-[12.5px] text-[var(--ds-muted)]">
                {data.region || "—"} · {data.city || "—"} · {data.website ?? ""}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
            <Stat label="MRR" value={formatCurrency(Number(data.monthly_recurring_revenue_usd), "USD", { compact: true })} />
            <Stat label="Developers" value={formatNumber(data.developer_count)} />
            <Stat label="Projects" value={formatNumber(data.application_count)} />
            <Stat label="Verif. rating" value={data.verification_rating} />
            <Stat label="Security score" value={<Badge tone={data.security_score > 80 ? "success" : "warning"}>{data.security_score}</Badge>} />
            <Stat label="Risk score" value={<Badge tone={data.operational_risk_score > 60 ? "critical" : "muted"}>{data.operational_risk_score}</Badge>} />
            <Stat label="Telecom" value={<StatusPill value={data.telecom_integration_status} />} />
          </div>
        </section>
        <OrganizationProfileTabs organization={data} />
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
