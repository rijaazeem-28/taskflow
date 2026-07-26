"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  reminderAtFromOffset,
  taskSchema,
  type Category,
  type Task,
  type TaskInput,
} from "@taskflow/shared";
import { createTaskAction, updateTaskAction } from "@/actions/tasks";
import { publishTasksChanged } from "@/lib/realtime-tasks";
import { zodResolver } from "@/lib/zod-resolver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReminderPicker } from "@/components/tasks/reminder-picker";

const EMPTY_CATEGORIES: Category[] = [];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  categories?: Category[];
  onSuccess?: () => void;
  defaultDueDate?: string | null;
  userId?: string;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  categories = EMPTY_CATEGORIES,
  onSuccess,
  defaultDueDate,
  userId,
}: Props) {
  const { reset, register, handleSubmit, watch, setValue, formState } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: "",
      category: "Work",
      categoryId: null,
      reminderOffset: "NONE",
      reminderAt: null,
    },
  });

  const taskId = task?.id ?? null;
  const defaultCategoryId = categories[0]?.id ?? null;
  const defaultCategoryName = categories[0]?.name ?? "Work";
  const wasOpen = useRef(false);
  const lastTaskId = useRef<string | null>(null);

  // Reset only when dialog opens or the edited task changes — avoids update loops.
  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      lastTaskId.current = null;
      return;
    }

    const justOpened = !wasOpen.current;
    const taskChanged = taskId !== lastTaskId.current;
    wasOpen.current = true;
    lastTaskId.current = taskId;

    if (!justOpened && !taskChanged) return;

    if (task) {
      reset({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        category: task.category ?? "Work",
        categoryId: task.categoryId ?? null,
        reminderOffset: task.reminderOffset ?? "NONE",
        reminderAt: task.reminderAt ?? null,
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: defaultDueDate ? defaultDueDate.slice(0, 10) : "",
        category: defaultCategoryName,
        categoryId: defaultCategoryId,
        reminderOffset: "NONE",
        reminderAt: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by open/taskId only
  }, [open, taskId, reset, defaultDueDate, defaultCategoryId, defaultCategoryName]);

  const onSubmit = handleSubmit(async (values) => {
    const category = categories.find((c) => c.id === values.categoryId);
    const reminderAt =
      values.reminderOffset === "CUSTOM"
        ? values.reminderAt
        : reminderAtFromOffset(values.dueDate, values.reminderOffset);

    const payload = {
      ...values,
      category: category?.name ?? values.category ?? null,
      categoryId: values.categoryId || null,
      dueDate: values.dueDate || null,
      description: values.description || null,
      reminderOffset: values.reminderOffset ?? "NONE",
      reminderAt,
    };

    const result = task
      ? await updateTaskAction({ id: task.id, ...payload })
      : await createTaskAction(payload);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    toast.success(task ? "Task updated" : "Task created");
    if (userId) void publishTasksChanged(userId, task ? "updated" : "created");
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your task." : "Add a new task to your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Project Meeting" {...register("title")} />
            {formState.errors.title ? (
              <p className="text-xs text-rose-500">{formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Optional details..." {...register("description")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) => setValue("priority", v as TaskInput["priority"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as TaskInput["status"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watch("categoryId") ?? ""}
                onValueChange={(v) => {
                  const cat = categories.find((c) => c.id === v);
                  setValue("categoryId", v);
                  setValue("category", cat?.name ?? null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ReminderPicker
            offset={watch("reminderOffset") ?? "NONE"}
            reminderAt={watch("reminderAt")}
            onOffsetChange={(offset) => setValue("reminderOffset", offset)}
            onReminderAtChange={(value) => setValue("reminderAt", value)}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
