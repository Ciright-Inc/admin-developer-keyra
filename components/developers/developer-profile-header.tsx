import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { TrustRing } from "@/components/ui/trust-ring";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  initialsOf,
  shortHash,
} from "@/lib/utils";
import type { Developer } from "@/types/admin";

export function DeveloperProfileHeader({ developer }: { developer: Developer }) {
  return (
    <section className="ds-profile-header flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="ds-avatar">{initialsOf(developer.display_name || developer.professional_email)}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-semibold text-[var(--ds-ink)] truncate">{developer.display_name || "Untitled developer"}</h2>
            <Badge tone={developer.account_status === "active" ? "success" : "error"} dot>
              {developer.account_status ?? "unknown"}
            </Badge>
            <StatusPill value={developer.verification_status} />
            {developer.enterprise_tier ? <Badge tone="accent">{developer.enterprise_tier.toUpperCase()}</Badge> : null}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[12.5px] text-[var(--ds-muted)]">
            <span>@{developer.username ?? "—"}</span>
            <span className="font-mono">{developer.professional_email}</span>
            <span className="font-mono">{developer.mobile_phone}</span>
            <span className="font-mono text-[11px]">{shortHash(developer.subscription_hash, 10)}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-[var(--ds-muted)]">
            <Badge tone="muted">{developer.country_iso2 ?? "—"}</Badge>
            <span>{developer.region || "—"}</span>
            <span>·</span>
            <span>{developer.city || "—"}</span>
            <span>·</span>
            <Badge tone="muted">{developer.industry_slug?.replace(/_/g, " ") ?? "—"}</Badge>
            <span>·</span>
            <span>Joined {formatDate(developer.created_at)}</span>
            <span>·</span>
            <span>Last seen {formatRelativeTime(developer.last_activity_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <TrustRing score={developer.trust_score ?? 0} label="Trust score" size={92} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Stat label="Apps" value={formatNumber(developer.application_count)} />
          <Stat label="Orgs" value={formatNumber(developer.organization_count)} />
          <Stat label="Team" value={formatNumber(developer.team_size)} />
          <Stat label="API 24h" value={formatNumber(Number(developer.api_calls_24h ?? 0), { compact: true })} />
          <Stat label="Revenue" value={formatCurrency(Number(developer.revenue_contribution_usd ?? 0), "USD", { compact: true })} />
          <Stat label="Reputation" value={developer.reputation_index ?? "—"} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost">
            <MaterialIcon name="forum" size={14} /> Message
          </Button>
          <Button variant="accent">
            <MaterialIcon name="verified_user" size={14} /> Verify
          </Button>
          <Button variant="danger">
            <MaterialIcon name="block" size={14} /> Suspend
          </Button>
        </div>
      </div>
    </section>
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
