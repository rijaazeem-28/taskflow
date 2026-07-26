"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeTaskStats, type ActivityItem, type Task } from "@taskflow/shared";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { RightPanel } from "@/components/layout/right-panel";
import { StatsCards } from "@/features/dashboard/stats-cards";
import { TasksOverview } from "@/features/dashboard/tasks-overview";
import { UpcomingTasks } from "@/features/dashboard/upcoming-tasks";
import { ProductivityChart } from "@/features/dashboard/productivity-chart";
import { RecentTasks } from "@/features/tasks/recent-tasks";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RealtimeTasksBridge } from "@/components/realtime/realtime-tasks-bridge";
import type { Category } from "@taskflow/shared";

type Props = {
  user: {
    id: string;
    fullName: string;
    bio?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  };
  tasks: Task[];
  categories?: Category[];
  firstName: string;
};

function buildActivities(tasks: Task[]): ActivityItem[] {
  const sorted = [...tasks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return sorted.slice(0, 4).map((t): ActivityItem => {
    if (t.status === "COMPLETED") {
      return {
        id: `a-${t.id}`,
        type: "completed",
        title: `Task "${t.title}" completed`,
        description: "",
        createdAt: t.updatedAt,
      };
    }
    if (new Date(t.createdAt).getTime() === new Date(t.updatedAt).getTime()) {
      return {
        id: `a-${t.id}`,
        type: "created",
        title: `New task "${t.title}" added`,
        description: "",
        createdAt: t.createdAt,
      };
    }
    return {
      id: `a-${t.id}`,
      type: "updated",
      title: `Task "${t.title}" updated`,
      description: "",
      createdAt: t.updatedAt,
    };
  });
}

export function DashboardShell({ user, tasks, categories = [], firstName }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [, startTransition] = useTransition();

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const activities = useMemo(() => buildActivities(tasks), [tasks]);

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

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
          title={`Welcome back, ${firstName}! 👋`}
          subtitle="Here's what's happening with your tasks today."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1 gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <main className="min-w-0 flex-1 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Task lists stay in sync across tabs and devices when Realtime is enabled.
              </p>
              <RealtimeTasksBridge userId={user.id} />
            </div>
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <TasksOverview stats={stats} />
              <UpcomingTasks tasks={tasks} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
              <RecentTasks tasks={tasks} onChanged={refresh} userId={user.id} />
              <ProductivityChart tasks={tasks} />
            </div>

            <div className="xl:hidden">
              <RightPanel tasks={tasks} activities={activities} />
            </div>
          </main>

          <RightPanel tasks={tasks} activities={activities} className="hidden xl:block" />
        </div>
      </div>

      <BottomNav />
      <TaskFormDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={refresh}
        categories={categories}
        userId={user.id}
      />
    </div>
  );
}
