"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { type ActivityItem, type Task } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { DueLabel } from "@/components/ui/due-label";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function MiniCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const today = new Date();

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; isToday: boolean }> = [];

    for (let i = 0; i < startPad; i++) cells.push({ day: null, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      cells.push({ day: d, isToday });
    }
    return cells;
  }, [cursor, today]);

  const label = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 items-center justify-center rounded-full",
                cell.day ? "text-slate-700" : "text-transparent",
                cell.isToday && "bg-violet-500 font-semibold text-white shadow-md shadow-violet-500/30"
              )}
            >
              {cell.day ?? "·"}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Priorities({ tasks }: { tasks: Task[] }) {
  const priorities = tasks
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">My Priorities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-2">
        {priorities.length === 0 ? (
          <p className="text-sm text-slate-400">No priority tasks yet.</p>
        ) : (
          priorities.map((task) => (
            <div key={task.id} className="rounded-xl bg-slate-50/80 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-800">{task.title}</p>
                <PriorityBadge priority={task.priority} size="sm" />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                <DueLabel dueDate={task.dueDate} />
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

const activityIcon = {
  completed: Check,
  updated: Pencil,
  created: Plus,
  joined: Users,
} as const;

const activityColor = {
  completed: "bg-emerald-100 text-emerald-600",
  updated: "bg-amber-100 text-amber-600",
  created: "bg-indigo-100 text-indigo-600",
  joined: "bg-pink-100 text-pink-600",
} as const;

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5 p-4 pt-2">
        {items.map((item) => {
          const Icon = activityIcon[item.type];
          return (
            <div key={item.id} className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  activityColor[item.type]
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400">
                  <RelativeTime date={item.createdAt} />
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function RightPanel({
  tasks,
  activities,
  className,
}: {
  tasks: Task[];
  activities: ActivityItem[];
  className?: string;
}) {
  return (
    <aside className={cn("w-full space-y-4 xl:w-[300px] xl:shrink-0", className)}>
      <MiniCalendar />
      <Priorities tasks={tasks} />
      <ActivityFeed items={activities} />
    </aside>
  );
}
