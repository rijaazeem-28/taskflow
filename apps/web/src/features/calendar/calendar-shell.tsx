"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Category, Task } from "@taskflow/shared";
import { PRIORITY_COLORS } from "@taskflow/shared";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarShell({
  user,
  tasks,
  categories,
}: {
  user: { fullName: string; bio?: string | null;
    role?: string | null; avatarUrl?: string | null };
  tasks: Task[];
  categories: Category[];
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [, startTransition] = useTransition();

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: Array<{ date: Date | null }> = [];
    for (let i = 0; i < startPad; i++) out.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) out.push({ date: new Date(year, month, d) });
    return out;
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = new Date(task.dueDate).toDateString();
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  const dayTasks = tasksByDay.get(selected.toDateString()) ?? [];
  const label = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setCreateOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Calendar"
          subtitle="View and plan tasks by date."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="grid flex-1 gap-5 px-4 py-5 lg:grid-cols-[1.4fr_1fr] sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{label}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) => {
                  if (!cell.date) return <div key={i} className="min-h-[72px]" />;
                  const key = cell.date.toDateString();
                  const dayList = tasksByDay.get(key) ?? [];
                  const isToday = key === today.toDateString();
                  const isSelected = key === selected.toDateString();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(cell.date!)}
                      className={cn(
                        "min-h-[72px] rounded-2xl border p-2 text-left transition",
                        isSelected
                          ? "border-violet-300 bg-violet-50"
                          : "border-transparent bg-slate-50/80 hover:bg-white hover:shadow-sm",
                        isToday && "ring-2 ring-violet-400"
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-800">{cell.date.getDate()}</div>
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {dayList.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: PRIORITY_COLORS[t.priority] }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {selected.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayTasks.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No tasks for this day.</p>
              ) : (
                dayTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3">
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <PriorityBadge priority={task.priority} size="sm" />
                      {task.category ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                          {task.category}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <BottomNav />
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        defaultDueDate={selected.toISOString()}
        onSuccess={() => startTransition(() => router.refresh())}
      />
    </div>
  );
}
