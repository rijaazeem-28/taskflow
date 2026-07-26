"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Category, TaskFilters, TaskPriority, TaskStatus } from "@taskflow/shared";
import { PRIORITY_LABELS, STATUS_LABELS } from "@taskflow/shared";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const ALL_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"];
const ALL_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export type FilterPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  categories?: Pick<Category, "id" | "name" | "color">[];
  className?: string;
};

type QuickFilterKey = "dueToday" | "upcoming" | "completed" | "overdue" | "pending";

const QUICK_FILTERS: { key: QuickFilterKey; label: string }[] = [
  { key: "dueToday", label: "Due today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

function toggleInList<T extends string>(list: T[] | undefined, value: T): T[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export function FilterPanel({
  open,
  onOpenChange,
  filters,
  onChange,
  categories = [],
  className,
}: FilterPanelProps) {
  const update = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch });

  const clearAll = () =>
    onChange({
      query: filters.query,
    });

  const activeCount =
    (filters.statuses?.length ?? 0) +
    (filters.priorities?.length ?? 0) +
    (filters.categoryIds?.length ?? 0) +
    QUICK_FILTERS.filter((q) => filters[q.key]).length;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-2xl border-slate-200 shadow-sm"
        onClick={() => onOpenChange(!open)}
      >
        <Filter className="h-4 w-4 text-indigo-500" />
        Filters
        {activeCount > 0 ? (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Filter tasks</h3>
                <div className="flex items-center gap-2">
                  {activeCount > 0 ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      onClick={clearAll}
                    >
                      Clear all
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[min(70vh,520px)] space-y-5 overflow-y-auto pr-1">
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Quick</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(({ key, label }) => {
                      const active = Boolean(filters[key]);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => update({ [key]: active ? undefined : true })}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium transition",
                            active
                              ? "bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)]"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <Separator />

                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                  <div className="space-y-2">
                    {ALL_STATUSES.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={filters.statuses?.includes(status) ?? false}
                          onCheckedChange={() =>
                            update({ statuses: toggleInList(filters.statuses, status) })
                          }
                        />
                        <span className="text-sm text-slate-700">{STATUS_LABELS[status]}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <Separator />

                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</p>
                  <div className="space-y-2">
                    {ALL_PRIORITIES.map((priority) => (
                      <label
                        key={priority}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={filters.priorities?.includes(priority) ?? false}
                          onCheckedChange={() =>
                            update({ priorities: toggleInList(filters.priorities, priority) })
                          }
                        />
                        <span className="text-sm text-slate-700">{PRIORITY_LABELS[priority]}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {categories.length > 0 ? (
                  <>
                    <Separator />
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Category
                      </p>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <label
                            key={cat.id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-50"
                          >
                            <Checkbox
                              checked={filters.categoryIds?.includes(cat.id) ?? false}
                              onCheckedChange={() =>
                                update({ categoryIds: toggleInList(filters.categoryIds, cat.id) })
                              }
                            />
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                              aria-hidden
                            />
                            <span className="text-sm text-slate-700">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  </>
                ) : null}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
