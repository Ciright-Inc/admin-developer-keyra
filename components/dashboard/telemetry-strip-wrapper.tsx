"use client";

import { useDashboardStream } from "@/hooks/use-dashboard-stream";
import { TelemetryStrip } from "./telemetry-strip";

export function TelemetryStripWrapper() {
  const { tick } = useDashboardStream();
  return <TelemetryStrip tick={tick} />;
}
