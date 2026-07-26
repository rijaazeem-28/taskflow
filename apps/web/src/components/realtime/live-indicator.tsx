"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealtimeStatus } from "@/hooks/use-realtime-tasks";

const LABELS: Record<RealtimeStatus, string> = {
  connecting: "Connecting…",
  live: "Live",
  error: "Realtime offline",
  off: "Offline",
};

export function LiveIndicator({
  status,
  className,
}: {
  status: RealtimeStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "live" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        status === "connecting" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        (status === "error" || status === "off") && "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
        className
      )}
      title="Updates automatically when tasks change"
    >
      <Radio
        className={cn("h-3.5 w-3.5", status === "live" && "animate-pulse text-emerald-500")}
        aria-hidden
      />
      {LABELS[status]}
    </span>
  );
}
