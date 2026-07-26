"use client";

import { motion } from "framer-motion";
import type { TaskPriority } from "@taskflow/shared";
import { PRIORITY_LABELS } from "@taskflow/shared";
import { cn } from "@/lib/utils";

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200/70 shadow-[0_2px_8px_rgba(16,185,129,0.12)]",
  MEDIUM: "bg-blue-50 text-blue-700 ring-blue-200/70 shadow-[0_2px_8px_rgba(59,130,246,0.12)]",
  HIGH: "bg-amber-50 text-amber-800 ring-amber-200/70 shadow-[0_2px_8px_rgba(245,158,11,0.15)]",
  URGENT: "bg-red-50 text-red-700 ring-red-200/70 shadow-[0_2px_8px_rgba(239,68,68,0.15)]",
};

const dotColors: Record<TaskPriority, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-amber-500",
  URGENT: "bg-red-500",
};

export type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
};

export function PriorityBadge({
  priority,
  className,
  showDot = true,
  size = "md",
}: PriorityBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        priorityStyles[priority],
        className
      )}
    >
      {showDot ? (
        <motion.span
          className={cn("rounded-full", dotColors[priority], size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      {PRIORITY_LABELS[priority]}
    </motion.span>
  );
}
