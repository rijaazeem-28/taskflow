"use client";

import { motion } from "framer-motion";
import type { TaskStatus } from "@taskflow/shared";
import { STATUS_COLORS, STATUS_LABELS } from "@taskflow/shared";
import { cn } from "@/lib/utils";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700 ring-slate-200/80",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200/70",
  COMPLETED: "bg-violet-50 text-violet-700 ring-violet-200/70",
  ON_HOLD: "bg-pink-50 text-pink-700 ring-pink-200/70",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200/70",
};

export type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
  size?: "sm" | "md";
};

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset shadow-[0_2px_8px_rgba(15,23,42,0.04)]",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        statusStyles[status],
        className
      )}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLORS[status] }}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </motion.span>
  );
}
