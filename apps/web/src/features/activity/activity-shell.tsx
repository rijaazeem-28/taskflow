"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bell,
  CheckCircle2,
  Filter,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import type { ActivityEvent, ActivityType } from "@/lib/activity-types";
import { groupActivity } from "@/lib/activity-types";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { EmptyState } from "@/components/tasks/empty-state";
import { PageTransition } from "@/components/layout/page-transition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";

const FILTERS: { value: "all" | ActivityType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "task_created", label: "Created" },
  { value: "task_updated", label: "Updated" },
  { value: "task_deleted", label: "Deleted" },
  { value: "status_changed", label: "Status" },
  { value: "category_changed", label: "Category" },
  { value: "reminder_added", label: "Reminder" },
  { value: "profile_updated", label: "Profile" },
];

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  task_created: Plus,
  task_updated: Pencil,
  task_deleted: Trash2,
  status_changed: CheckCircle2,
  category_changed: FolderKanban,
  reminder_added: Bell,
  profile_updated: UserRound,
};

const TONES: Record<ActivityType, string> = {
  task_created: "bg-emerald-50 text-emerald-600",
  task_updated: "bg-indigo-50 text-indigo-600",
  task_deleted: "bg-rose-50 text-rose-600",
  status_changed: "bg-violet-50 text-violet-600",
  category_changed: "bg-amber-50 text-amber-600",
  reminder_added: "bg-sky-50 text-sky-600",
  profile_updated: "bg-pink-50 text-pink-600",
};

type Props = {
  user: { fullName: string; role?: string | null; avatarUrl?: string | null };
  events: ActivityEvent[];
};

export function ActivityShell({ user, events }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ActivityType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter !== "all" && e.type !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.type.includes(q)
      );
    });
  }, [events, filter, query]);

  const groups = useMemo(() => groupActivity(filtered), [filtered]);
  const groupKeys = Object.keys(groups) as Array<keyof typeof groups>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setQuickAddOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Activity"
          subtitle="A searchable timeline of everything that happened."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <PageTransition className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activity…"
                className="pl-9"
                aria-label="Search activity"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === f.value
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Create, update, or complete tasks to build your timeline."
              action={
                <Button onClick={() => setQuickAddOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add a task
                </Button>
              }
            />
          ) : (
            <div className="space-y-8">
              {groupKeys.map((group) => {
                const items = groups[group];
                if (!items.length) return null;
                return (
                  <section key={group} aria-labelledby={`activity-${group}`}>
                    <h2
                      id={`activity-${group}`}
                      className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {group}
                    </h2>
                    <ol className="relative space-y-4 border-l border-slate-200 pl-6">
                      <AnimatePresence initial={false}>
                        {items.map((event, index) => {
                          const Icon = ICONS[event.type] ?? Activity;
                          return (
                            <motion.li
                              key={event.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="relative"
                            >
                              <span
                                className={cn(
                                  "absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ring-4 ring-[#F8FAFC]",
                                  TONES[event.type]
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h3 className="text-sm font-semibold text-slate-900">{event.title}</h3>
                                  <RelativeTime
                                    className="text-xs text-slate-400"
                                    date={event.createdAt}
                                  />
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                              </article>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ol>
                  </section>
                );
              })}
            </div>
          )}
        </PageTransition>
      </div>
      <BottomNav />
      <TaskFormDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
