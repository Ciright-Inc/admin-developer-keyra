import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Badge } from "@/components/ui/badge";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { TelemetryStripWrapper } from "@/components/dashboard/telemetry-strip-wrapper";
import { OperationalPanels } from "@/components/dashboard/operational-panels";
import { getDashboardSnapshot } from "@/features/dashboard/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span>GLOBAL // COMMAND DECK</span>
            <Badge tone="success" dot>LIVE</Badge>
          </>
        }
        title="KEYRA Global Command Deck"
        subtitle="Real-time telemetry across every developer, organization, application, AI agent and telecom integration in the worldwide KEYRA ecosystem."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost">
              <MaterialIcon name="download" size={14} />
              Export snapshot
            </Button>
            <Button variant="accent">
              <MaterialIcon name="bolt" size={14} />
              Open ops console
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <TelemetryStripWrapper />
        <MetricsGrid initial={snapshot} />
        <OperationalPanels />
      </div>
    </>
  );
}
