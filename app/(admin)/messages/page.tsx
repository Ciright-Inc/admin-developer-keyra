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

const SEGMENTS = ["all", "active", "enterprise", "ai_developers", "telecom_partners", "government", "trial", "dormant"];
const CHANNELS = [
  { id: "in_app", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "webhook", label: "Webhook" },
];

export default function MessagesPage() {
  const list = useSWR<{ ok: true; items: GlobalMessage[] }>("/messages", swrFetcher, { refreshInterval: 30000 });

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [segment, setSegment] = React.useState("all");
  const [channels, setChannels] = React.useState<string[]>(["in_app"]);
  const [schedule, setSchedule] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const toggleChannel = (id: string) => {
    setChannels((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  };

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body required");
      return;
    }
    setSending(true);
    try {
      await adminFetch("/messages", {
        method: "POST",
        body: { title: title.trim(), body: body.trim(), segment, channels, scheduledFor: schedule || undefined },
      });
      toast.success(schedule ? "Broadcast scheduled" : "Broadcast sent");
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

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // GLOBAL MESSAGING</span><Badge tone="accent" dot>READY</Badge></>}
        title="Global broadcasts"
        subtitle="Compose targeted broadcasts to developer segments across in-app, email, SMS and webhook channels."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[460px,1fr] gap-3">
        <Panel title="Composer" icon="edit_square">
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] tracking-wider uppercase text-(--ds-muted)">Title</label>
              <input className="ds-input w-full mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Broadcast title" />
            </div>
            <div>
              <label className="text-[11px] tracking-wider uppercase text-(--ds-muted)">Message body</label>
              <textarea className="ds-input min-h-[120px] w-full mt-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Use clear, operational language. Markdown supported." />
            </div>
            <div>
              <label className="text-[11px] tracking-wider uppercase text-(--ds-muted)">Segment</label>
              <select className="ds-select w-full mt-1" value={segment} onChange={(e) => setSegment(e.target.value)}>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-wider uppercase text-(--ds-muted)">Channels</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleChannel(c.id)}
                    className={`ds-btn ds-btn--sm ${channels.includes(c.id) ? "ds-btn--accent" : "ds-btn--ghost"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] tracking-wider uppercase text-(--ds-muted)">Schedule (optional)</label>
              <input type="datetime-local" className="ds-input w-full mt-1" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </div>
            <Button variant="accent" onClick={send} disabled={sending} className="w-full">
              <MaterialIcon name="send" size={13} /> {schedule ? "Schedule broadcast" : "Send broadcast now"}
            </Button>
          </div>
        </Panel>

        <Panel title="Delivery history" icon="history" bodyClassName="!p-0" flush>
          <div className="ds-table-wrap !rounded-none !border-0">
            <table className="ds-table ds-table--compact">
              <thead><tr><th>Title</th><th>Segment</th><th>Channels</th><th>Status</th><th>Recipients</th><th>Read</th><th>Sent</th></tr></thead>
              <tbody>
                {(list.data?.items ?? []).map((m) => {
                  const channelLabels = Array.isArray(m.channels) ? m.channels : (typeof m.channels === "string" ? JSON.parse(m.channels) : []);
                  const readRate = m.recipients > 0 ? Math.round((m.read_count / m.recipients) * 100) : 0;
                  return (
                    <tr key={m.id}>
                      <td className="text-(--ds-ink) font-medium max-w-[260px]"><div className="truncate" title={m.title}>{m.title}</div><div className="text-[11px] text-(--ds-muted) truncate" title={m.body}>{m.body}</div></td>
                      <td><Badge tone="muted">{m.segment}</Badge></td>
                      <td className="text-[11px]">{(channelLabels as string[]).join(", ")}</td>
                      <td><StatusPill value={m.status} /></td>
                      <td className="font-mono tabular-nums">{formatNumber(m.recipients)}</td>
                      <td className="font-mono tabular-nums">{formatNumber(m.read_count)} <span className="text-(--ds-muted)">({readRate}%)</span></td>
                      <td className="text-[11.5px] font-mono">{m.sent_at ? formatRelativeTime(m.sent_at) : m.scheduled_for ? `at ${formatRelativeTime(m.scheduled_for)}` : "—"}</td>
                    </tr>
                  );
                })}
                {list.isLoading && <tr><td colSpan={7} className="text-center py-12 text-(--ds-muted)">Loading…</td></tr>}
                {!list.isLoading && (list.data?.items ?? []).length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-(--ds-muted)">No broadcasts yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
