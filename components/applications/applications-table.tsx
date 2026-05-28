"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { swrFetcher } from "@/lib/admin-fetch";
import { revokeApplication, suspendApplication } from "@/features/applications/services/application-service";
import type { Application, ListResponse } from "@/types/admin";

const FRAMEWORKS = [
  { value: "android", label: "Android", icon: "android" },
  { value: "ios", label: "iOS", icon: "phone_iphone" },
  { value: "react", label: "React", icon: "code" },
  { value: "flutter", label: "Flutter", icon: "flutter_dash" },
  { value: "java", label: "Java", icon: "coffee" },
  { value: "python", label: "Python", icon: "terminal" },
  { value: "unspecified", label: "Unspecified", icon: "help_outline" },
] as const;

const STATUSES = ["active", "draft", "archived"];
const ENVIRONMENTS = ["sandbox", "production"];

const FRAMEWORK_LABELS: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  react: "React",
  flutter: "Flutter",
  java: "Java",
  python: "Python",
  unspecified: "Unspecified",
};

export function ApplicationsTable() {
  const searchParams = useSearchParams();
  const platformFromUrl = searchParams.get("platform") ?? "";

  const [search, setSearch] = React.useState("");
  const [framework, setFramework] = React.useState(platformFromUrl);
  React.useEffect(() => {
    setFramework(platformFromUrl);
  }, [platformFromUrl]);
  const [status, setStatus] = React.useState("");
  const [environment, setEnvironment] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 30;

  const filterKey = `${search}|${framework}|${status}|${environment}`;
  const [prevKey, setPrevKey] = React.useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setPage(1);
  }

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (framework) qs.set("platform", framework);
  if (status) qs.set("status", status);
  if (environment) qs.set("environment", environment);
  qs.set("page", String(page));
  qs.set("limit", String(limit));

  const { data, isLoading, mutate } = useSWR<ListResponse<Application>>(
    `/applications?${qs}`,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onRevoke = async (id: string) => {
    try {
      await revokeApplication(id);
      toast.success("API keys revoked");
      void mutate();
    } catch (e) {
      toast.error(`Revoke failed: ${(e as Error).message}`);
    }
  };
  const onSuspend = async (id: string) => {
    try {
      await suspendApplication(id);
      toast.success("Project archived");
      void mutate();
    } catch (e) {
      toast.error(`Archive failed: ${(e as Error).message}`);
    }
  };

  return (
    <Panel
      title="Projects"
      icon="folder_special"
      subtitle={`${formatNumber(total)} registered`}
      bodyClassName="!p-0"
      flush
      actions={
        <Button variant="ghost" size="sm" onClick={() => void mutate()}>
          <MaterialIcon name="refresh" size={13} /> Refresh
        </Button>
      }
    >
      <div className="px-4 pt-4 flex flex-col gap-3">
        <ProjectsFilterBar
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          environment={environment}
          onEnvironment={setEnvironment}
          onReset={() => {
            setSearch("");
            setFramework("");
            setStatus("");
            setEnvironment("");
          }}
        />
        <FrameworkFilter framework={framework} onFramework={setFramework} />
      </div>

      <div className="ds-table-wrap is-scrollable mt-4">
        <table className="ds-table ds-table--compact">
          <thead>
            <tr>
              <th className="ds-table__col-sticky">Project</th>
              <th>Developer</th>
              <th>Organization</th>
              <th>Framework</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Listing</th>
              <th>API keys</th>
              <th>Updated</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-[var(--ds-muted)]">
                  <MaterialIcon name="hourglass" size={14} /> Loading projects…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-[var(--ds-muted)]">
                  <div className="flex flex-col items-center gap-2">
                    <MaterialIcon name="search_off" size={20} />
                    <div>No projects match the current filters.</div>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="ds-table__col-sticky">
                    <Link href={`/applications/${p.id}`} className="block group min-w-[200px]">
                      <div className="text-[12.5px] text-[var(--ds-ink)] font-medium truncate group-hover:text-[var(--keyra-accent)]">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[var(--ds-muted)] font-mono truncate">{p.slug}</div>
                    </Link>
                  </td>
                  <td>
                    {p.developer_account_id ? (
                      <Link
                        href={`/developers/${p.developer_account_id}`}
                        className="text-[11.5px] text-[var(--ds-body)] hover:text-[var(--keyra-accent)] truncate max-w-[140px] inline-block"
                      >
                        {p.developer_owner_name ?? "—"}
                      </Link>
                    ) : (
                      <span className="text-[11.5px]">{p.developer_owner_name ?? "—"}</span>
                    )}
                  </td>
                  <td>
                    {p.organization_id && p.organization_name ? (
                      <Link
                        href={`/organizations/${p.organization_id}`}
                        className="text-[11.5px] text-[var(--ds-body)] hover:text-[var(--keyra-accent)] truncate max-w-[140px] inline-block"
                      >
                        {p.organization_name}
                      </Link>
                    ) : (
                      <span className="text-[var(--ds-muted)]">—</span>
                    )}
                  </td>
                  <td>
                    <FrameworkBadge framework={p.framework || p.platform} />
                  </td>
                  <td>
                    <Badge tone={p.environment === "production" ? "accent" : "muted"}>
                      {p.environment ?? "—"}
                    </Badge>
                  </td>
                  <td>
                    <StatusPill value={p.status} />
                  </td>
                  <td>
                    <StatusPill value={p.production_listing_review_status ?? "none"} />
                  </td>
                  <td className="font-mono tabular-nums text-[11.5px]">
                    {formatNumber(Number(p.active_api_key_count ?? p.api_key_count ?? 0))}
                  </td>
                  <td className="text-[11.5px] font-mono whitespace-nowrap">
                    {formatRelativeTime(p.updated_at)}
                  </td>
                  <td>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button size="icon" variant="ghost">
                          <MaterialIcon name="more_horiz" size={14} />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="ds-menu" sideOffset={6} align="end">
                          <DropdownMenu.Item
                            className="ds-menu__item"
                            onSelect={(e) => {
                              e.preventDefault();
                              window.location.href = `/applications/${p.id}`;
                            }}
                          >
                            <MaterialIcon name="visibility" size={14} /> View project
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="ds-menu__sep" />
                          <DropdownMenu.Item
                            className="ds-menu__item"
                            onSelect={() => onSuspend(p.id)}
                            data-destructive="true"
                          >
                            <MaterialIcon name="archive" size={14} /> Archive
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="ds-menu__item"
                            onSelect={() => onRevoke(p.id)}
                            data-destructive="true"
                          >
                            <MaterialIcon name="vpn_key_off" size={14} /> Revoke API keys
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ds-pagination">
        <div>
          Page <strong className="text-[var(--ds-ink)]">{page}</strong> of{" "}
          <strong className="text-[var(--ds-ink)]">{totalPages}</strong>
          {" · "}
          <span className="font-mono tabular-nums">{formatNumber(total)} total</span>
        </div>
        <div className="ds-pagination__actions">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <MaterialIcon name="chevron_left" size={14} /> Prev
          </Button>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next <MaterialIcon name="chevron_right" size={14} />
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function ProjectsFilterBar(props: {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  environment: string;
  onEnvironment: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="ds-filter-bar">
      <div className="relative flex-1 min-w-[240px]">
        <MaterialIcon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-muted)]" />
        <input
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search projects, developers…"
          className="ds-input ds-input--icon"
        />
      </div>
      <div className="w-[150px] min-w-[150px]">
        <select className="ds-select" value={props.status} onChange={(e) => props.onStatus(e.target.value)}>
          <option value="">Status (all)</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[170px] min-w-[170px]">
        <select className="ds-select" value={props.environment} onChange={(e) => props.onEnvironment(e.target.value)}>
          <option value="">Environment (all)</option>
          {ENVIRONMENTS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <Button variant="ghost" size="sm" onClick={props.onReset}>
        <MaterialIcon name="restart_alt" size={13} /> Reset
      </Button>
    </div>
  );
}

function FrameworkFilter({ framework, onFramework }: { framework: string; onFramework: (v: string) => void }) {
  return (
    <div className="ds-platform-filter">
      <div className="ds-platform-filter__scroll" role="tablist" aria-label="Filter by framework">
        <FrameworkChip label="All frameworks" value="" active={framework === ""} onClick={() => onFramework("")} />
        {FRAMEWORKS.map((f) => (
          <FrameworkChip
            key={f.value}
            label={f.label}
            icon={f.icon}
            value={f.value}
            active={framework === f.value}
            onClick={() => onFramework(f.value)}
          />
        ))}
      </div>
    </div>
  );
}

function FrameworkChip({
  label,
  icon,
  value,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-value={value}
      data-active={active ? "true" : "false"}
      onClick={onClick}
      className="ds-platform-chip"
    >
      {icon ? <MaterialIcon name={icon} size={13} /> : null}
      <span>{label}</span>
    </button>
  );
}

function FrameworkBadge({ framework }: { framework: string }) {
  const key = framework?.toLowerCase() || "unspecified";
  const label = (FRAMEWORK_LABELS[key] ?? framework) || "—";
  const icon = FRAMEWORKS.find((f) => f.value === key)?.icon ?? "folder";
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--ds-body)] whitespace-nowrap">
      <MaterialIcon name={icon} size={12} className="text-[var(--keyra-accent)]" />
      <span>{label}</span>
    </span>
  );
}
