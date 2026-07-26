"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  filterTasks,
  formatDate,
  sortTasks,
  type Category,
  type SortOption,
  type Task,
  type TaskFilters,
} from "@taskflow/shared";
import { createTaskAction, deleteTaskAction, toggleTaskAction, updateTaskAction } from "@/actions/tasks";
import { publishTasksChanged } from "@/lib/realtime-tasks";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RealtimeTasksBridge } from "@/components/realtime/realtime-tasks-bridge";
import { SearchBar, HighlightedText } from "@/components/tasks/search-bar";
import { FilterPanel } from "@/components/tasks/filter-panel";
import { SortDropdown } from "@/components/tasks/sort-dropdown";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { EmptyState } from "@/components/tasks/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";

type Props = {
  user: { id: string; fullName: string; bio?: string | null;
    role?: string | null; avatarUrl?: string | null };
  tasks: Task[];
  categories: Category[];
};

export function WorkspaceShell({ user, tasks, categories }: Props) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);
  const syncLive = useCallback(() => {
    void publishTasksChanged(user.id);
  }, [user.id]);

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, filters), sort),
    [tasks, filters, sort]
  );

  const onDelete = (task: Task) => {
    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        return;
      }
      toast.success("Task deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            void createTaskAction({
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate,
              category: task.category,
              categoryId: task.categoryId,
              reminderOffset: task.reminderOffset ?? "NONE",
              reminderAt: task.reminderAt,
            }).then((r) => {
              if (r.success) {
                toast.success("Task restored");
                syncLive();
                refresh();
              }
            });
          },
        },
      });
      syncLive();
      refresh();
    });
  };

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
          title="My Tasks"
          subtitle="Search, filter, and organize your work."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 space-y-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <SearchBar
                value={filters.query ?? ""}
                onChange={(query) => setFilters((f) => ({ ...f, query }))}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RealtimeTasksBridge userId={user.id} />
              <FilterPanel
                open={filterOpen}
                onOpenChange={setFilterOpen}
                filters={filters}
                onChange={setFilters}
                categories={categories}
              />
              <SortDropdown value={sort} onChange={setSort} />
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-800">{visible.length}</span> of{" "}
            {tasks.length} tasks
          </p>

          {visible.length === 0 ? (
            <EmptyState
              title={filters.query ? "No matching tasks" : "No tasks yet"}
              description={
                filters.query
                  ? "Try a different search or clear filters."
                  : "Create your first task to get started."
              }
              action={
                !filters.query ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Task
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {visible.map((task) => (
                <Card key={task.id} className="transition hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                          checked={task.status === "COMPLETED"}
                          disabled={pending}
                          onChange={(e) =>
                            startTransition(async () => {
                              await toggleTaskAction(task.id, e.target.checked);
                              syncLive();
                              refresh();
                            })
                          }
                        />
                        <div className="min-w-0">
                          <p
                            className={
                              task.status === "COMPLETED"
                                ? "font-semibold text-slate-400 line-through"
                                : "font-semibold text-slate-900"
                            }
                          >
                            <HighlightedText text={task.title} query={filters.query} />
                          </p>
                          {task.description ? (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              <HighlightedText text={task.description} query={filters.query} />
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pl-7">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.category ? (
                          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                            {task.category}
                          </span>
                        ) : null}
                        <span className="text-xs text-slate-400">{formatDate(task.dueDate)}</span>
                        {task.reminderOffset && task.reminderOffset !== "NONE" ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            Reminder
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-7 sm:pl-0">
                      <select
                        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium"
                        value={task.status}
                        onChange={(e) =>
                          startTransition(async () => {
                            await updateTaskAction({
                              id: task.id,
                              status: e.target.value as Task["status"],
                            });
                            toast.success("Status updated");
                            syncLive();
                            refresh();
                          })
                        }
                      >
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(task)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => onDelete(task)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
      <TaskFormDialog
        open={createOpen || !!editing}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
        task={editing}
        categories={categories}
        onSuccess={() => {
          syncLive();
          refresh();
        }}
        userId={user.id}
      />
    </div>
  );
}
