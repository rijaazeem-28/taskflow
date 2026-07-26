import type { SortOption, Task, TaskFilters, TaskPriority, TaskStats } from "../types";

const priorityRank: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "COMPLETED" || task.status === "CANCELLED") return false;
  return new Date(task.dueDate).getTime() < startOfDay().getTime();
}

export function isDueToday(task: Task) {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  return due >= startOfDay() && due <= endOfDay();
}

export function isUpcoming(task: Task) {
  if (!task.dueDate || task.status === "COMPLETED" || task.status === "CANCELLED") return false;
  const due = new Date(task.dueDate);
  return due > endOfDay();
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pending = tasks.filter((t) => t.status === "TODO").length;
  const onHold = tasks.filter((t) => t.status === "ON_HOLD").length;
  const cancelled = tasks.filter((t) => t.status === "CANCELLED").length;
  const overdue = tasks.filter(isOverdue).length;
  const today = tasks.filter(isDueToday).length;
  const upcoming = tasks.filter(isUpcoming).length;

  return {
    total,
    completed,
    inProgress,
    pending,
    onHold,
    cancelled,
    overdue,
    today,
    upcoming,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    totalChange: 12,
    completedChange: 8,
    inProgressChange: 5,
    pendingChange: -3,
  };
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const q = filters.query?.trim().toLowerCase();

  return tasks.filter((task) => {
    if (q) {
      const hay = `${task.title} ${task.description ?? ""} ${task.category ?? ""} ${task.priority} ${task.status}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.statuses?.length && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities?.length && !filters.priorities.includes(task.priority)) return false;
    if (filters.categoryIds?.length) {
      const id = task.categoryId ?? task.category ?? "";
      if (!filters.categoryIds.includes(id) && !filters.categoryIds.includes(task.category ?? "")) {
        return false;
      }
    }
    if (filters.dueToday && !isDueToday(task)) return false;
    if (filters.upcoming && !isUpcoming(task)) return false;
    if (filters.completed && task.status !== "COMPLETED") return false;
    if (filters.overdue && !isOverdue(task)) return false;
    if (filters.pending && task.status !== "TODO") return false;
    return true;
  });
}

export function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  const list = [...tasks];
  switch (sort) {
    case "oldest":
      return list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    case "dueDate":
      return list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return +new Date(a.dueDate) - +new Date(b.dueDate);
      });
    case "priority":
      return list.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    case "alphabetical":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "completedFirst":
      return list.sort((a, b) => Number(b.status === "COMPLETED") - Number(a.status === "COMPLETED"));
    case "pendingFirst":
      return list.sort((a, b) => Number(a.status === "COMPLETED") - Number(b.status === "COMPLETED"));
    case "newest":
    default:
      return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
}

export function highlightMatch(text: string, query?: string) {
  if (!query?.trim()) return [{ text, match: false }];
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text);
}

export function reminderAtFromOffset(dueDate: string | null | undefined, offset: string | null | undefined) {
  if (!dueDate || !offset || offset === "NONE" || offset === "CUSTOM") return null;
  const due = new Date(dueDate).getTime();
  const map: Record<string, number> = {
    "15M": 15 * 60 * 1000,
    "30M": 30 * 60 * 1000,
    "1H": 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
  };
  const ms = map[offset];
  if (!ms) return null;
  return new Date(due - ms).toISOString();
}
