"use server";

import { revalidatePath } from "next/cache";
import { taskSchema, updateTaskSchema } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import {
  createTask,
  deleteTask,
  listTasks,
  toggleTaskComplete,
  updateTask,
} from "@/services/tasks";
import { logActivity } from "@/lib/activity-store";

export type TaskActionResult = {
  success: boolean;
  error?: string;
  task?: Awaited<ReturnType<typeof createTask>>;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getMyTasksAction() {
  const userId = await requireUserId();
  return listTasks(userId);
}

export async function createTaskAction(input: unknown): Promise<TaskActionResult> {
  try {
    const parsed = taskSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid task" };
    }
    const userId = await requireUserId();
    const task = await createTask(userId, parsed.data);
    await logActivity(userId, {
      type: "task_created",
      title: `Created “${task.title}”`,
      description: task.category ? `Category: ${task.category}` : "New task added",
      meta: { taskId: task.id },
    }).catch(() => undefined);
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/analytics");
    revalidatePath("/activity");
    return { success: true, task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create task" };
  }
}

export async function updateTaskAction(input: unknown): Promise<TaskActionResult> {
  try {
    const parsed = updateTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid task" };
    }
    const userId = await requireUserId();
    const task = await updateTask(userId, parsed.data);
    if (!task) return { success: false, error: "Task not found" };
    const reminderTouched =
      parsed.data.reminderOffset !== undefined || parsed.data.reminderAt !== undefined;
    await logActivity(userId, {
      type: reminderTouched
        ? "reminder_added"
        : parsed.data.status
          ? "status_changed"
          : parsed.data.categoryId || parsed.data.category
            ? "category_changed"
            : "task_updated",
      title: reminderTouched
        ? `Reminder set on “${task.title}”`
        : parsed.data.status
          ? `Status → ${task.status} for “${task.title}”`
          : `Updated “${task.title}”`,
      description: `Priority ${task.priority}`,
      meta: { taskId: task.id, status: task.status },
    }).catch(() => undefined);
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/analytics");
    revalidatePath("/activity");
    return { success: true, task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update task" };
  }
}

export async function deleteTaskAction(id: string): Promise<TaskActionResult> {
  try {
    const userId = await requireUserId();
    const task = await deleteTask(id, userId);
    if (!task) return { success: false, error: "Task not found" };
    await logActivity(userId, {
      type: "task_deleted",
      title: `Deleted “${task.title}”`,
      description: "Task removed from your workspace",
      meta: { taskId: task.id },
    }).catch(() => undefined);
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/analytics");
    revalidatePath("/activity");
    return { success: true, task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete task" };
  }
}

export async function toggleTaskAction(id: string, completed: boolean): Promise<TaskActionResult> {
  try {
    const userId = await requireUserId();
    const task = await toggleTaskComplete(id, userId, completed);
    if (!task) return { success: false, error: "Task not found" };
    await logActivity(userId, {
      type: "status_changed",
      title: completed ? `Completed “${task.title}”` : `Reopened “${task.title}”`,
      description: `Status set to ${task.status}`,
      meta: { taskId: task.id, status: task.status },
    }).catch(() => undefined);
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/analytics");
    revalidatePath("/activity");
    return { success: true, task };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update task" };
  }
}
