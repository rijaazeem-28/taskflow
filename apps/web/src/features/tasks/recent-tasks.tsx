"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatDate,
  PRIORITY_LABELS,
  type Task,
} from "@taskflow/shared";
import { deleteTaskAction, toggleTaskAction } from "@/actions/tasks";
import { publishTasksChanged } from "@/lib/realtime-tasks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";

function categoryVariant(category?: string | null) {
  const c = (category ?? "").toLowerCase();
  if (c.includes("design")) return "design" as const;
  if (c.includes("dev")) return "development" as const;
  if (c.includes("meet")) return "meeting" as const;
  return "default" as const;
}

function priorityVariant(priority: Task["priority"]) {
  if (priority === "URGENT" || priority === "HIGH") return "high" as const;
  if (priority === "MEDIUM") return "medium" as const;
  return "low" as const;
}

export function RecentTasks({
  tasks,
  onChanged,
  title = "Recent Tasks",
  showAll = false,
  userId,
}: {
  tasks: Task[];
  onChanged?: () => void;
  title?: string;
  showAll?: boolean;
  userId?: string;
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = showAll ? tasks : tasks.slice(0, 6);

  const onToggle = (task: Task, checked: boolean) => {
    startTransition(async () => {
      const result = await toggleTaskAction(task.id, checked);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
        return;
      }
      toast.success(checked ? "Marked complete" : "Marked incomplete");
      if (userId) void publishTasksChanged(userId, "toggled");
      onChanged?.();
    });
  };

  const onDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteTaskAction(deleting.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        return;
      }
      toast.success("Task deleted");
      setDeleting(null);
      if (userId) void publishTasksChanged(userId, "deleted");
      onChanged?.();
    });
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="p-5 pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-5 sm:pt-2">
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No tasks yet</p>
              <p className="mt-1 text-sm text-slate-400">Create your first task to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Task</th>
                    <th className="px-3 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Priority</th>
                    <th className="px-3 py-3 font-semibold">Assignee</th>
                    <th className="px-5 py-3 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/70 last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={task.status === "COMPLETED"}
                            onCheckedChange={(v) => onToggle(task, v === true)}
                            disabled={pending}
                          />
                          <span
                            className={
                              task.status === "COMPLETED"
                                ? "text-sm text-slate-400 line-through"
                                : "text-sm font-medium text-slate-800"
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={categoryVariant(task.category)}>
                          {task.category ?? "General"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-slate-500">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={priorityVariant(task.priority)}>
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px]">YO</AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(task)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-700"
                              onClick={() => setDeleting(task)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        task={editing}
        onSuccess={onChanged}
        userId={userId}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              This will permanently remove “{deleting?.title}”. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} disabled={pending}>
              {pending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
