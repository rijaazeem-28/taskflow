"use server";

import { createClient } from "@/lib/supabase/server";
import {
  groupActivity,
  listActivity,
  logActivity,
  type ActivityEvent,
  type ActivityType,
} from "@/lib/activity-store";
import { listTasks } from "@/services/tasks";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function recordActivityAction(
  input: Omit<ActivityEvent, "id" | "userId" | "createdAt">
) {
  const userId = await requireUserId();
  return logActivity(userId, input);
}

function toIso(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function deriveFromTasks(
  userId: string,
  tasks: Awaited<ReturnType<typeof listTasks>>
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const t of [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 40)) {
    const created = new Date(t.createdAt).getTime() === new Date(t.updatedAt).getTime();
    if (t.status === "COMPLETED") {
      events.push({
        id: `derived-done-${t.id}`,
        userId,
        type: "status_changed",
        title: `Completed “${t.title}”`,
        description: "Status set to Completed",
        createdAt: toIso(t.updatedAt),
        meta: { taskId: t.id, status: t.status },
      });
    } else if (created) {
      events.push({
        id: `derived-create-${t.id}`,
        userId,
        type: "task_created",
        title: `Created “${t.title}”`,
        description: t.category ? `Category: ${t.category}` : "New task added",
        createdAt: toIso(t.createdAt),
        meta: { taskId: t.id },
      });
    } else {
      events.push({
        id: `derived-update-${t.id}`,
        userId,
        type: "task_updated",
        title: `Updated “${t.title}”`,
        description: `Status: ${t.status}`,
        createdAt: toIso(t.updatedAt),
        meta: { taskId: t.id, status: t.status },
      });
    }
  }
  return events;
}

export async function getActivityAction() {
  const userId = await requireUserId();
  const stored = await listActivity(userId);
  if (stored.length > 0) {
    return { events: stored, groups: groupActivity(stored) };
  }
  const tasks = await listTasks(userId).catch(() => []);
  const derived = deriveFromTasks(userId, tasks);
  return { events: derived, groups: groupActivity(derived) };
}
