"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { type ActivityItem, type Task } from "@taskflow/shared";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { RightPanel } from "@/components/layout/right-panel";
import { RecentTasks } from "@/features/tasks/recent-tasks";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  user: {
    fullName: string;
    bio?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  };
  tasks: Task[];
};

function buildActivities(tasks: Task[]): ActivityItem[] {
  return [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      type: t.status === "COMPLETED" ? ("completed" as const) : ("updated" as const),
      title: t.title,
      description: "",
      createdAt: t.updatedAt,
    }));
}

export function TasksShell({ user, tasks }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setCreateOpen(true)}
        user={user}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          title="My Tasks"
          subtitle="Create, edit, and track every task in one place."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex flex-1 gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <main className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-800">{tasks.length}</span> tasks
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>

            <RecentTasks tasks={tasks} onChanged={refresh} title="All Tasks" showAll />

            <div className="xl:hidden">
              <RightPanel tasks={tasks} activities={buildActivities(tasks)} />
            </div>
          </main>

          <RightPanel
            tasks={tasks}
            activities={buildActivities(tasks)}
            className="hidden xl:block"
          />
        </div>
      </div>

      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={refresh} />
    </div>
  );
}
