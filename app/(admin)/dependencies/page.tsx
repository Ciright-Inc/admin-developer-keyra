"use client";

import * as React from "react";
import useSWR from "swr";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { swrFetcher } from "@/lib/admin-fetch";

interface ApiNode {
  id: string;
  label: string;
  type: "organization" | "application" | "ai_agent";
  country?: string;
  platform?: string;
  mrr?: number;
  trust?: number | string;
}
interface ApiEdge { id: string; source: string; target: string; kind: string }
interface GraphResp { ok: true; data: { nodes: ApiNode[]; edges: ApiEdge[] } }

const TYPE_FILTERS = [
  { value: "all", label: "All entities" },
  { value: "organization", label: "Organizations" },
  { value: "application", label: "Applications" },
  { value: "ai_agent", label: "AI Agents" },
];

export default function DependenciesPage() {
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [limit, setLimit] = React.useState(120);
  const { data, isLoading } = useSWR<GraphResp>(`/dependencies/graph?limit=${limit}`, swrFetcher);

  const { nodes, edges } = React.useMemo(() => {
    if (!data) return { nodes: [] as Node[], edges: [] as Edge[] };
    const apiNodes = data.data.nodes;
    const filtered = typeFilter === "all" ? apiNodes : apiNodes.filter((n) => n.type === typeFilter);
    const filteredIds = new Set(filtered.map((n) => n.id));

    const groups: Record<ApiNode["type"], ApiNode[]> = { organization: [], application: [], ai_agent: [] };
    for (const n of filtered) groups[n.type].push(n);

    const colX: Record<ApiNode["type"], number> = { organization: 0, application: 480, ai_agent: 960 };
    const flowNodes: Node[] = [];
    (Object.keys(groups) as ApiNode["type"][]).forEach((t) => {
      groups[t].forEach((n, idx) => {
        flowNodes.push({
          id: n.id,
          position: { x: colX[t], y: idx * 56 },
          data: { label: n.label },
          style: {
            background: t === "organization" ? "rgba(122,162,247,0.16)" : t === "application" ? "rgba(255,184,108,0.16)" : "rgba(180,140,255,0.16)",
            border: `1px solid ${t === "organization" ? "rgba(122,162,247,0.45)" : t === "application" ? "rgba(255,184,108,0.45)" : "rgba(180,140,255,0.45)"}`,
            color: "var(--ds-ink)",
            fontSize: 12,
            borderRadius: 8,
            padding: "6px 10px",
            width: 220,
          },
        });
      });
    });

    const flowEdges: Edge[] = data.data.edges
      .filter((e) => filteredIds.has(e.source) && filteredIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.kind,
        style: { stroke: "rgba(180,180,200,0.45)" },
        labelStyle: { fill: "var(--ds-muted)", fontSize: 10 },
      }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [data, typeFilter]);

  return (
    <>
      <PageHeader
        eyebrow={<><span>SECTION // ECOSYSTEM DEPENDENCIES</span><Badge tone="accent" dot>LIVE</Badge></>}
        title="Ecosystem dependency graph"
        subtitle="Trust chains across organizations, applications and AI agents. Filter by entity type, expand the limit to materialize more relationships."
      />

      <Panel
        title="Live graph"
        icon="account_tree"
        subtitle={data ? `${data.data.nodes.length} nodes · ${data.data.edges.length} edges` : ""}
        actions={
          <div className="flex items-center gap-2">
            <select className="ds-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {TYPE_FILTERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select className="ds-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={60}>60 nodes</option>
              <option value={120}>120 nodes</option>
              <option value={240}>240 nodes</option>
              <option value={500}>500 nodes</option>
            </select>
          </div>
        }
        bodyClassName="!p-0"
        flush
      >
        <div style={{ height: 640, background: "var(--ds-surface-deep)" }} className="rounded-b-md">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-(--ds-muted) text-[12px]">Loading dependency graph…</div>
          ) : (
            <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }} colorMode="dark">
              <Background color="var(--ds-hairline)" gap={24} />
              <Controls className="!bg-transparent" />
              <MiniMap pannable zoomable nodeColor={(n) => String(n.style?.background || "rgba(122,162,247,0.4)")} maskColor="rgba(8,10,15,0.7)" />
            </ReactFlow>
          )}
        </div>
      </Panel>

      <Panel title="Legend" icon="info">
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-(--ds-body)">
          <Legend color="rgba(122,162,247,0.7)" label="Organization" />
          <Legend color="rgba(255,184,108,0.7)" label="Application" />
          <Legend color="rgba(180,140,255,0.7)" label="AI Agent" />
        </div>
      </Panel>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ background: color }} className="w-3 h-3 rounded-sm border border-(--ds-hairline-strong)" />
      <span>{label}</span>
    </div>
  );
}
