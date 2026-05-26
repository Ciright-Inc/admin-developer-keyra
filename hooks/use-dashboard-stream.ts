"use client";

import { useEffect, useState } from "react";
import { ADMIN_API_BASE } from "@/lib/admin-backend-url";
import type { DashboardStreamTick } from "@/types/admin";

const DEFAULT_TICK_MS = Number(process.env.NEXT_PUBLIC_REALTIME_TICK_MS ?? 5000) || 5000;

/**
 * Subscribes to /admin/global/dashboard/stream (SSE) and returns the latest tick.
 * Falls back gracefully if the stream is unreachable; the dashboard page handles null.
 */
export function useDashboardStream(intervalMs: number = DEFAULT_TICK_MS) {
  const [tick, setTick] = useState<DashboardStreamTick | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${ADMIN_API_BASE}/dashboard/stream?tick=${intervalMs}`;
    let es: EventSource | null = null;
    let cancelled = false;

    const onTick = (event: MessageEvent) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(event.data) as DashboardStreamTick;
        setTick(data);
      } catch {
        // ignore malformed payloads
      }
    };
    const onError = () => {
      if (cancelled) return;
      setError("stream_disconnected");
    };

    try {
      es = new EventSource(url, { withCredentials: true });
      es.addEventListener("tick", onTick as EventListener);
      es.addEventListener("error", onError as EventListener);
    } catch (err) {
      queueMicrotask(() => {
        if (!cancelled) setError(String((err as Error)?.message ?? err));
      });
    }

    return () => {
      cancelled = true;
      es?.removeEventListener("tick", onTick as EventListener);
      es?.removeEventListener("error", onError as EventListener);
      es?.close();
    };
  }, [intervalMs]);

  return { tick, error };
}
