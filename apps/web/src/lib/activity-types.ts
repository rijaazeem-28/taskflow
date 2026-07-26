export type ActivityType =
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "status_changed"
  | "category_changed"
  | "reminder_added"
  | "profile_updated";

export type ActivityEvent = {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  meta?: Record<string, string | null | undefined>;
};

export function groupActivity(events: ActivityEvent[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today);
  week.setDate(week.getDate() - 7);

  const groups: Record<"Today" | "Yesterday" | "This Week" | "Older", ActivityEvent[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: [],
  };

  for (const event of events) {
    const d = new Date(event.createdAt);
    if (d >= today) groups.Today.push(event);
    else if (d >= yesterday) groups.Yesterday.push(event);
    else if (d >= week) groups["This Week"].push(event);
    else groups.Older.push(event);
  }

  return groups;
}
