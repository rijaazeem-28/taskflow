"use client";

import type { LucideIcon } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = ClipboardList,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <motion.div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600 shadow-[0_8px_20px_rgba(99,102,241,0.15)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
