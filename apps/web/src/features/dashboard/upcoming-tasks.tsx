"use client";

import Link from "next/link";
import { formatTime, type Task } from "@taskflow/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const upcoming = [...tasks]
    .filter((t) => t.dueDate && t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-2">
        <CardTitle>Upcoming Tasks</CardTitle>
        <Link href="/tasks" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-2">
        {upcoming.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No upcoming tasks with due dates.</p>
        ) : (
          upcoming.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-3 transition hover:bg-white hover:shadow-sm"
            >
              <div className="w-16 shrink-0 text-xs font-semibold text-slate-500">
                {formatTime(task.dueDate!)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {task.category ?? "Work"}
                </p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[10px]">TF</AvatarFallback>
              </Avatar>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
