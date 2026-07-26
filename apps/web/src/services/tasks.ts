import { randomUUID } from "crypto";
import {
  reminderAtFromOffset,
  type ReminderOffset,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from "@taskflow/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureSchema } from "@/lib/ensure-schema";
import { canUseLocalStore } from "@/lib/runtime";
import {
  localCreateTask,
  localDeleteTask,
  localGetTask,
  localListTasks,
  localUpdateTask,
} from "@/lib/local-store";
import { createProfile, getProfileByUserId } from "@/services/profile";

export type DbTask = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  category: string | null;
  categoryId: string | null;
  reminderOffset: ReminderOffset | null;
  reminderAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapTask(row: Record<string, unknown>): DbTask {
  return {
    id: String(row.id),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    priority: (row.priority as TaskPriority) ?? "MEDIUM",
    status: (row.status as TaskStatus) ?? "TODO",
    dueDate: row.due_date || row.dueDate ? new Date(String(row.due_date ?? row.dueDate)) : null,
    category: (row.category as string | null) ?? null,
    categoryId: ((row.category_id ?? row.categoryId) as string | null) ?? null,
    reminderOffset: ((row.reminder_offset ?? row.reminderOffset) as ReminderOffset | null) ?? "NONE",
    reminderAt:
      row.reminder_at || row.reminderAt
        ? new Date(String(row.reminder_at ?? row.reminderAt))
        : null,
    userId: String(row.user_id ?? row.userId),
    createdAt: new Date(String(row.created_at ?? row.createdAt ?? Date.now())),
    updatedAt: new Date(String(row.updated_at ?? row.updatedAt ?? Date.now())),
  };
}

async function ensureProfile(userId: string) {
  const existing = await getProfileByUserId(userId);
  if (existing) return existing;
  return createProfile({
    userId,
    fullName: "TaskFlow User",
    email: `${userId}@taskflow.local`,
  });
}

function mergeTasks(remote: DbTask[], local: DbTask[]) {
  const map = new Map<string, DbTask>();
  for (const task of remote) map.set(task.id, task);
  for (const task of local) map.set(task.id, task);
  return [...map.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function withReminder(data: TaskInput | UpdateTaskInput) {
  const offset = data.reminderOffset ?? "NONE";
  const due = data.dueDate ?? null;
  const reminderAt =
    offset === "CUSTOM" ? (data.reminderAt ?? null) : reminderAtFromOffset(due, offset);
  return { offset, reminderAt };
}

function taskPayload(task: {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  category: string | null;
  categoryId: string | null;
  reminderOffset: ReminderOffset | null;
  reminderAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate ? task.dueDate.toISOString() : null,
    category: task.category,
    category_id: task.categoryId,
    reminder_offset: task.reminderOffset ?? "NONE",
    reminder_at: task.reminderAt ? task.reminderAt.toISOString() : null,
    user_id: task.userId,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
  };
}

export async function listTasks(userId: string): Promise<DbTask[]> {
  const local = canUseLocalStore() ? await localListTasks(userId) : [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (!error && data) {
      return mergeTasks(
        data.map((row) => mapTask(row as Record<string, unknown>)),
        local
      );
    }
    if (error && !canUseLocalStore()) {
      throw new Error(error.message || "Failed to load tasks");
    }
  } catch (e) {
    if (!canUseLocalStore()) throw e;
    console.error("[tasks] list supabase exception", e);
  }
  return local;
}

export async function getTask(id: string, userId: string): Promise<DbTask | null> {
  if (canUseLocalStore()) {
    const local = await localGetTask(id, userId);
    if (local) return local;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!error && data) return mapTask(data as Record<string, unknown>);
  } catch (e) {
    console.error("[tasks] get supabase exception", e);
  }
  return null;
}

export async function createTask(userId: string, data: TaskInput): Promise<DbTask> {
  await ensureSchema();
  await ensureProfile(userId);
  const { offset, reminderAt } = withReminder(data);
  const now = new Date();
  const task: DbTask = {
    id: randomUUID(),
    title: data.title,
    description: data.description ?? null,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    category: data.category ?? null,
    categoryId: data.categoryId ?? null,
    reminderOffset: offset,
    reminderAt: reminderAt ? new Date(reminderAt) : null,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const admin = createAdminClient();
    const full = taskPayload(task);
    let { data: row, error } = await admin.from("tasks").insert(full).select("*").single();

    // Retry with base columns if phase-2 columns are missing or URGENT isn't allowed yet.
    if (error) {
      const minimal = {
        id: full.id,
        title: full.title,
        description: full.description,
        priority: full.priority === "URGENT" ? "HIGH" : full.priority,
        status: full.status,
        due_date: full.due_date,
        category: full.category,
        user_id: full.user_id,
        created_at: full.created_at,
        updated_at: full.updated_at,
      };
      ({ data: row, error } = await admin.from("tasks").insert(minimal).select("*").single());
    }

    if (error) throw new Error(error.message);
    if (row) return mapTask(row as Record<string, unknown>);
  } catch (e) {
    if (!canUseLocalStore()) {
      throw e instanceof Error ? e : new Error("Failed to create task");
    }
    console.warn("[tasks] supabase create failed, using local store", e);
  }

  return localCreateTask(userId, {
    ...data,
    reminderOffset: offset,
    reminderAt,
  });
}

export async function updateTask(userId: string, data: UpdateTaskInput): Promise<DbTask | null> {
  const existing = await getTask(data.id, userId);
  if (!existing) return null;

  const mergedDue =
    data.dueDate !== undefined
      ? data.dueDate
      : existing.dueDate
        ? existing.dueDate.toISOString()
        : null;
  const { offset, reminderAt } = withReminder({
    ...data,
    dueDate: mergedDue,
    reminderOffset: data.reminderOffset ?? existing.reminderOffset ?? "NONE",
    reminderAt: data.reminderAt ?? existing.reminderAt?.toISOString() ?? null,
  } as UpdateTaskInput);

  const next: DbTask = {
    ...existing,
    title: data.title ?? existing.title,
    description: data.description !== undefined ? (data.description ?? null) : existing.description,
    priority: data.priority ?? existing.priority,
    status: data.status ?? existing.status,
    dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : existing.dueDate,
    category: data.category !== undefined ? (data.category ?? null) : existing.category,
    categoryId: data.categoryId !== undefined ? (data.categoryId ?? null) : existing.categoryId,
    reminderOffset: offset,
    reminderAt: reminderAt ? new Date(reminderAt) : null,
    updatedAt: new Date(),
  };

  try {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("tasks")
      .upsert(taskPayload(next), { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    if (row) {
      if (canUseLocalStore()) {
        await localUpdateTask(userId, {
          ...data,
          reminderOffset: offset,
          reminderAt,
        }).catch(() => undefined);
      }
      return mapTask(row as Record<string, unknown>);
    }
  } catch (e) {
    if (!canUseLocalStore()) {
      throw e instanceof Error ? e : new Error("Failed to update task");
    }
    console.warn("[tasks] supabase update failed, using local store", e);
  }

  return localUpdateTask(userId, {
    ...data,
    reminderOffset: offset,
    reminderAt,
  });
}

export async function deleteTask(id: string, userId: string): Promise<DbTask | null> {
  const existing = await getTask(id, userId);
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("tasks").delete().eq("id", id).eq("user_id", userId);
    if (error && !canUseLocalStore()) throw new Error(error.message);
  } catch (e) {
    if (!canUseLocalStore()) {
      throw e instanceof Error ? e : new Error("Failed to delete task");
    }
    console.error("[tasks] delete supabase exception", e);
  }

  if (canUseLocalStore()) {
    return (await localDeleteTask(id, userId)) ?? existing;
  }
  return existing;
}

export async function toggleTaskComplete(
  id: string,
  userId: string,
  completed: boolean
): Promise<DbTask | null> {
  return updateTask(userId, {
    id,
    status: completed ? "COMPLETED" : "TODO",
  });
}
