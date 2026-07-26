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
    offset === "CUSTOM"
      ? data.reminderAt ?? null
      : reminderAtFromOffset(due, offset);
  return { offset, reminderAt };
}

async function syncTaskToSupabase(task: DbTask) {
  try {
    const admin = createAdminClient();
    await admin.from("tasks").upsert(
      {
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
      },
      { onConflict: "id" }
    );
  } catch (e) {
    console.warn("[tasks] supabase sync skipped", e instanceof Error ? e.message : e);
  }
}

export async function listTasks(userId: string): Promise<DbTask[]> {
  const local = await localListTasks(userId);
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
  } catch (e) {
    console.error("[tasks] list supabase exception", e);
  }
  return local;
}

export async function getTask(id: string, userId: string): Promise<DbTask | null> {
  const local = await localGetTask(id, userId);
  if (local) return local;
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
  const task = await localCreateTask(userId, {
    ...data,
    reminderOffset: offset,
    reminderAt,
  });
  await syncTaskToSupabase(task);
  return task;
}

export async function updateTask(userId: string, data: UpdateTaskInput): Promise<DbTask | null> {
  const existing = await getTask(data.id, userId);
  const mergedDue = data.dueDate !== undefined ? data.dueDate : existing?.dueDate?.toISOString();
  const { offset, reminderAt } = withReminder({
    ...data,
    dueDate: mergedDue,
    reminderOffset: data.reminderOffset ?? existing?.reminderOffset ?? "NONE",
    reminderAt: data.reminderAt ?? existing?.reminderAt?.toISOString() ?? null,
  } as UpdateTaskInput);

  const task = await localUpdateTask(userId, {
    ...data,
    reminderOffset: offset,
    reminderAt,
  });
  if (task) {
    await syncTaskToSupabase(task);
    return task;
  }
  return null;
}

export async function deleteTask(id: string, userId: string): Promise<DbTask | null> {
  const local = await localDeleteTask(id, userId);
  try {
    const admin = createAdminClient();
    await admin.from("tasks").delete().eq("id", id).eq("user_id", userId);
  } catch (e) {
    console.error("[tasks] delete supabase exception", e);
  }
  return local;
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
