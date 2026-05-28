"use client";

import * as React from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { StatusPill } from "@/components/ui/status-pill";
import { MetricCard } from "@/components/ui/metric-card";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { adminFetch, swrFetcher } from "@/lib/admin-fetch";

interface GlobalMessage {
  id: string;
  title: string;
  body: string;
  segment: string;
  channels: string[] | string | null;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  author_name: string | null;
  recipients: number;
  read_count: number;
}

const SEGMENTS = [
  { value: "all", label: "All developers" },
  { value: "active", label: "Active accounts" },
  { value: "enterprise", label: "Enterprise tier" },
  { value: "ai_developers", label: "AI developers" },
  { value: "telecom_partners", label: "Telecom partners" },
  { value: "government", label: "Government" },
  { value: "trial", label: "Trial / startup" },
  { value: "dormant", label: "Dormant" },
] as const;

const CHANNELS = [
  { id: "in_app", label: "In-app", icon: "notifications" },
  { id: "email", label: "Email", icon: "mail" },
  { id: "sms", label: "SMS", icon: "sms" },
  { id: "webhook", label: "Webhook", icon: "webhook" },
] as const;

function parseChannels(raw: GlobalMessage["channels"]): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function segmentLabel(segment: string) {
  return SEGMENTS.find((s) => s.value === segment)?.label ?? segment.replace(/_/g, " ");
}

export default function MessagesPage() {
  const list = useSWR<{ ok: true; items: GlobalMessage[] }>("/messages", swrFetcher, { refreshInterval: 30000 });

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [segment, setSegment] = React.useState("all");
  const [channels, setChannels] = React.useState<string[]>(["in_app"]);
  const [schedule, setSchedule] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const items = list.data?.items ?? [];
  const totalRecipients = items.reduce((n, m) => n + (m.recipients ?? 0), 0);
  const sentCount = items.filter((m) => m.status === "sent").length;
  const scheduledCount = items.filter((m) => m.status === "scheduled").length;

  const toggleChannel = (id: string) => {
    setChannels((c) => {
      if (c.includes(id)) {
        if (c.length <= 1) {
          toast.error("Select at least one channel");
          return c;
        }
        return c.filter((x) => x !== id);
      }
      return [...c, id];
    });
  };

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required");
      return;
    }
    if (!channels.length) {
      toast.error("Select at least one channel");
      return;
    }
    if (schedule) {
      const at = new Date(schedule);
      if (Number.isNaN(at.getTime())) {
        toast.error("Invalid schedule date");
        return;
      }
      if (at.getTime() <= Date.now()) {
        toast.error("Schedule must be in the future");
        return;
      }
    }

    setSending(true);
    try {
      const res = await adminFetch<{ ok: true; data: GlobalMessage & { recipient_count?: number } }>(
        "/messages",
        {
          method: "POST",
          body: { title: title.trim(), body: body.trim(), segment, channels, scheduledFor: schedule || undefined },
        },
      );
      const count = res.data?.recipient_count ?? 0;
      if (schedule) {
        toast.success(`Broadcast scheduled · ${formatNumber(count)} recipients queued`);
      } else {
        toast.success(
          count > 0
            ? `Broadcast sent to ${formatNumber(count)} developer${count === 1 ? "" : "s"}`
            : "Broadcast saved (no matching recipients for this segment)",
        );
      }
      setTitle("");
      setBody("");
      setSchedule("");
      void list.mutate();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const isScheduled = Boolean(schedule);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>SECTION // GLOBAL MESSAGING</span>
            <Badge tone="info" dot>
              LIVE
            </Badge>
          </>
        }
        title="Global broadcasts"
        subtitle="Target developer segments with in-app, email, SMS, and webhook delivery. Recipients are resolved from live developer accounts."
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricCard icon="campaign" label="Broadcasts" value={items.length} format="number" />
        <MetricCard icon="send" label="Sent" value={sentCount} format="number" />
        <MetricCard icon="schedule" label="Scheduled" value={scheduledCount} format="number" />
        <MetricCard icon="groups" label="Total deliveries" value={totalRecipients} format="number" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,400px)_1fr] gap-4 items-start">
        <Panel title="Composer" icon="edit_square" subtitle="Draft and send">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="ds-field">
              <label className="ds-field-label" htmlFor="broadcast-title">
                Title <span className="text-[var(--ds-muted)]">*</span>
              </label>
              <input
                id="broadcast-title"
                className="ds-input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Broadcast title"
                disabled={sending}
              />
            </div>

            <div className="ds-field">
              <label className="ds-field-label" htmlFor="broadcast-body">
                Message body <span className="text-[var(--ds-muted)]">*</span>
              </label>
              <textarea
                id="broadcast-body"
                className="ds-input ds-create-drawer__textarea w-full min-h-[140px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Use clear, operational language. Markdown supported."
                disabled={sending}
              />
            </div>

            <div className="ds-field">
              <label className="ds-field-label" htmlFor="broadcast-segment">
                Audience segment
              </label>
              <select
                id="broadcast-segment"
                className="ds-select w-full"
                value={segment}
                disabled={sending}
                onChange={(e) => setSegment(e.target.value)}
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field">
              <span className="ds-field-label">Channels</span>
              <div className="ds-channel-picker" role="group" aria-label="Delivery channels">
                {CHANNELS.map((c) => {
                  const on = channels.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={sending}
                      className={`ds-channel-picker__chip ${on ? "is-selected" : ""}`}
                      onClick={() => toggleChannel(c.id)}
                      aria-pressed={on}
                    >
                      <MaterialIcon name={c.icon} size={14} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <p className="ds-create-drawer__hint mt-1">In-app creates a row per matching developer account.</p>
            </div>

            <div className="ds-field">
              <label className="ds-field-label" htmlFor="broadcast-schedule">
                Schedule (optional)
              </label>
              <input
                id="broadcast-schedule"
                type="datetime-local"
                className="ds-input w-full"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-[var(--ds-hairline)]">
              <Button type="button" variant="ghost" disabled={sending} onClick={() => {
                setTitle("");
                setBody("");
                setSchedule("");
                setSegment("all");
                setChannels(["in_app"]);
              }}>
                Reset
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={sending || !title.trim() || !body.trim()}
                className="sm:ml-auto"
                aria-busy={sending}
              >
                {sending ? (
                  <>
                    <MaterialIcon name="hourglass_empty" size={14} />
                    Sending…
                  </>
                ) : (
                  <>
                    <MaterialIcon name={isScheduled ? "schedule_send" : "send"} size={14} />
                    {isScheduled ? "Schedule broadcast" : "Send broadcast now"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel
          title="Delivery history"
          icon="history"
          subtitle={list.isLoading ? "Loading…" : `${items.length} broadcast${items.length === 1 ? "" : "s"}`}
          bodyClassName="!p-0"
          flush
          actions={
            <Button variant="ghost" size="sm" onClick={() => void list.mutate()}>
              <MaterialIcon name="refresh" size={13} />
            </Button>
          }
        >
          <div className="ds-table-wrap is-scrollable !rounded-none !border-0 max-h-[min(70vh,640px)]">
            <table className="ds-table ds-table--compact">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Segment</th>
                  <th>Channels</th>
                  <th>Status</th>
                  <th className="text-right">Recipients</th>
                  <th className="text-right">Read</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {list.isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-[var(--ds-muted)]">
                      <MaterialIcon name="hourglass" size={16} className="inline mr-1 align-[-2px]" />
                      Loading broadcasts…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16">
                      <div className="flex flex-col items-center text-center px-6">
                        <MaterialIcon name="campaign" size={32} className="text-[var(--ds-muted)] opacity-40" />
                        <p className="mt-3 text-[14px] text-[var(--ds-ink)]">No broadcasts yet</p>
                        <p className="mt-1 max-w-sm text-[12px] text-[var(--ds-muted)]">
                          Compose a message on the left to notify developers in the selected segment.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((m) => {
                    const channelLabels = parseChannels(m.channels)
                      .map((id) => CHANNELS.find((c) => c.id === id)?.label ?? id)
                      .join(", ");
                    const readRate = m.recipients > 0 ? Math.round((m.read_count / m.recipients) * 100) : 0;
                    return (
                      <tr key={m.id}>
                        <td className="max-w-[240px]">
                          <div className="text-[13px] font-medium text-[var(--ds-ink)] truncate" title={m.title}>
                            {m.title}
                          </div>
                          <div className="text-[11px] text-[var(--ds-muted)] truncate" title={m.body}>
                            {m.body}
                          </div>
                          {m.author_name ? (
                            <div className="text-[10px] text-[var(--ds-muted)] mt-0.5">by {m.author_name}</div>
                          ) : null}
                        </td>
                        <td>
                          <Badge tone="muted">{segmentLabel(m.segment)}</Badge>
                        </td>
                        <td className="text-[11.5px] text-[var(--ds-body)]">{channelLabels || "—"}</td>
                        <td>
                          <StatusPill value={m.status} />
                        </td>
                        <td className="font-mono tabular-nums text-right text-[13px]">
                          {formatNumber(m.recipients)}
                        </td>
                        <td className="font-mono tabular-nums text-right text-[13px]">
                          {formatNumber(m.read_count)}
                          {m.recipients > 0 ? (
                            <span className="text-[var(--ds-muted)] text-[11px]"> ({readRate}%)</span>
                          ) : null}
                        </td>
                        <td className="text-[11.5px] font-mono whitespace-nowrap text-[var(--ds-muted)]">
                          {m.sent_at
                            ? formatRelativeTime(m.sent_at)
                            : m.scheduled_for
                              ? `Scheduled ${formatRelativeTime(m.scheduled_for)}`
                              : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
