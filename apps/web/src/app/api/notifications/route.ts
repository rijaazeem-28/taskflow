import { NextResponse } from "next/server";
import { isDueToday, isOverdue, relativeTime } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import { listTasks } from "@/services/tasks";
import { serializeTask } from "@/lib/serialize";
import { listActivity } from "@/lib/activity-store";

export type AppNotification = {
  id: string;
  type: "overdue" | "due_today" | "reminder" | "activity";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = (await listTasks(user.id).catch(() => [])).map(serializeTask);
  const notifications: AppNotification[] = [];

  for (const task of tasks) {
    if (isOverdue(task)) {
      notifications.push({
        id: `overdue-${task.id}`,
        type: "overdue",
        title: `Overdue: ${task.title}`,
        description: "This task is past its due date",
        href: "/tasks",
        createdAt: task.dueDate ?? task.updatedAt,
      });
    } else if (isDueToday(task) && task.status !== "COMPLETED" && task.status !== "CANCELLED") {
      notifications.push({
        id: `due-${task.id}`,
        type: "due_today",
        title: `Due today: ${task.title}`,
        description: "Finish this before the day ends",
        href: "/tasks",
        createdAt: task.dueDate ?? task.updatedAt,
      });
    }

    if (
      task.reminderAt &&
      task.reminderOffset &&
      task.reminderOffset !== "NONE" &&
      new Date(task.reminderAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000 &&
      new Date(task.reminderAt).getTime() >= Date.now() - 60 * 60 * 1000 &&
      task.status !== "COMPLETED" &&
      task.status !== "CANCELLED"
    ) {
      notifications.push({
        id: `reminder-${task.id}`,
        type: "reminder",
        title: `Reminder: ${task.title}`,
        description: `Scheduled ${relativeTime(task.reminderAt)}`,
        href: "/tasks",
        createdAt: task.reminderAt,
      });
    }
  }

  const activity = await listActivity(user.id).catch(() => []);
  for (const event of activity.filter((e) => e.type !== "profile_updated").slice(0, 8)) {
    notifications.push({
      id: `activity-${event.id}`,
      type: "activity",
      title: event.title,
      description: event.description,
      href: "/activity",
      createdAt: event.createdAt,
    });
  }

  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const items = notifications.slice(0, 20);
  return NextResponse.json({
    notifications: items,
    unread: items.length,
  });
}
