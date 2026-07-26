import {
  isOverdue,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@taskflow/shared";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function avgHours(msList: number[]) {
  if (!msList.length) return 0;
  const avg = msList.reduce((a, b) => a + b, 0) / msList.length;
  return Math.round((avg / 36e5) * 10) / 10;
}

export type AnalyticsSnapshot = {
  dailyCompleted: number;
  weeklyCompleted: number;
  monthlyCompleted: number;
  tasksCompleted: number;
  tasksCreatedWeek: number;
  tasksCreatedMonth: number;
  pending: number;
  overdue: number;
  completionRate: number;
  averageCompletionHours: number;
  mostProductiveDay: string;
  mostUsedCategory: string;
  mostUsedPriority: string;
  todayProgress: number;
  productivityScore: number;
  currentStreak: number;
  longestStreak: number;
  finishedToday: number;
  averageTasksPerDay: number;
  overduePercentage: number;
  weeklyLine: { day: string; completed: number; created: number }[];
  monthlyBars: { week: string; created: number; completed: number }[];
  statusDonut: { name: string; value: number; color: string }[];
  priorityPie: { name: string; value: number; color: string }[];
  categoryBars: { name: string; value: number }[];
  completionTrend: { day: string; rate: number }[];
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "#64748B",
  IN_PROGRESS: "#3B82F6",
  COMPLETED: "#8B5CF6",
  ON_HOLD: "#EC4899",
  CANCELLED: "#F43F5E",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "#10B981",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#EF4444",
};

export function buildAnalytics(tasks: Task[]): AnalyticsSnapshot {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = daysAgo(6);
  const monthStart = daysAgo(29);

  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const pending = tasks.filter((t) => t.status === "TODO").length;
  const overdue = tasks.filter(isOverdue).length;

  const finishedToday = completed.filter((t) => new Date(t.updatedAt) >= todayStart).length;
  const weeklyCompleted = completed.filter((t) => new Date(t.updatedAt) >= weekStart).length;
  const monthlyCompleted = completed.filter((t) => new Date(t.updatedAt) >= monthStart).length;

  const createdWeek = tasks.filter((t) => new Date(t.createdAt) >= weekStart).length;
  const createdMonth = tasks.filter((t) => new Date(t.createdAt) >= monthStart).length;

  const completionTimes = completed
    .map((t) => new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime())
    .filter((ms) => ms > 0 && ms < 1000 * 60 * 60 * 24 * 60);

  const byDayCompleted: Record<string, number> = {};
  for (const t of completed) {
    const key = new Date(t.updatedAt).toLocaleDateString("en-US", { weekday: "long" });
    byDayCompleted[key] = (byDayCompleted[key] ?? 0) + 1;
  }
  const mostProductiveDay =
    Object.entries(byDayCompleted).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const byCategory: Record<string, number> = {};
  for (const t of tasks) {
    const key = t.category || "Uncategorized";
    byCategory[key] = (byCategory[key] ?? 0) + 1;
  }
  const mostUsedCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const byPriority: Record<string, number> = {};
  for (const t of tasks) {
    byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
  }
  const topPriority = Object.entries(byPriority).sort((a, b) => b[1] - a[1])[0]?.[0] as
    | TaskPriority
    | undefined;
  const mostUsedPriority = topPriority ? PRIORITY_LABELS[topPriority] : "—";

  const completionRate =
    tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);
  const overduePercentage =
    tasks.length === 0 ? 0 : Math.round((overdue / tasks.length) * 100);

  const weeklyLine = Array.from({ length: 7 }).map((_, i) => {
    const day = daysAgo(6 - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: label,
      completed: completed.filter((t) => {
        const d = new Date(t.updatedAt);
        return d >= day && d < next;
      }).length,
      created: tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= day && d < next;
      }).length,
    };
  });

  const monthlyBars = Array.from({ length: 4 }).map((_, i) => {
    const start = daysAgo(28 - i * 7);
    const end = daysAgo(21 - i * 7);
    return {
      week: `W${i + 1}`,
      created: tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= start && d < end;
      }).length,
      completed: completed.filter((t) => {
        const d = new Date(t.updatedAt);
        return d >= start && d < end;
      }).length,
    };
  });

  const statusDonut = (Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).length,
    color: STATUS_COLOR[status],
  })).filter((x) => x.value > 0);

  const priorityPie = (Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => ({
    name: PRIORITY_LABELS[priority],
    value: tasks.filter((t) => t.priority === priority).length,
    color: PRIORITY_COLOR[priority],
  })).filter((x) => x.value > 0);

  const categoryBars = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const completionTrend = weeklyLine.map((d) => ({
    day: d.day,
    rate: d.created === 0 ? (d.completed > 0 ? 100 : 0) : Math.round((d.completed / d.created) * 100),
  }));

  // streak: consecutive days with at least 1 completion ending today/yesterday
  let currentStreak = 0;
  for (let i = 0; i < 60; i++) {
    const day = daysAgo(i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const has = completed.some((t) => {
      const d = new Date(t.updatedAt);
      return d >= day && d < next;
    });
    if (has) currentStreak += 1;
    else if (i > 0) break;
    else break;
  }

  let longestStreak = 0;
  let run = 0;
  for (let i = 59; i >= 0; i--) {
    const day = daysAgo(i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const has = completed.some((t) => {
      const d = new Date(t.updatedAt);
      return d >= day && d < next;
    });
    if (has) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else run = 0;
  }

  const averageTasksPerDay =
    Math.round(((createdMonth || tasks.length) / 30) * 10) / 10;

  const productivityScore = Math.min(
    100,
    Math.round(
      completionRate * 0.45 +
        Math.min(weeklyCompleted * 8, 35) +
        Math.min(currentStreak * 4, 20)
    )
  );

  const todayDue = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= todayStart && d < new Date(todayStart.getTime() + 86400000);
  });
  const todayDone = todayDue.filter((t) => t.status === "COMPLETED").length;
  const todayProgress =
    todayDue.length === 0 ? (finishedToday > 0 ? 100 : 0) : Math.round((todayDone / todayDue.length) * 100);

  return {
    dailyCompleted: finishedToday,
    weeklyCompleted,
    monthlyCompleted,
    tasksCompleted: completed.length,
    tasksCreatedWeek: createdWeek,
    tasksCreatedMonth: createdMonth,
    pending,
    overdue,
    completionRate,
    averageCompletionHours: avgHours(completionTimes),
    mostProductiveDay,
    mostUsedCategory,
    mostUsedPriority,
    todayProgress,
    productivityScore,
    currentStreak,
    longestStreak,
    finishedToday,
    averageTasksPerDay,
    overduePercentage,
    weeklyLine,
    monthlyBars,
    statusDonut: statusDonut.length ? statusDonut : [{ name: "Empty", value: 1, color: "#E2E8F0" }],
    priorityPie: priorityPie.length ? priorityPie : [{ name: "Empty", value: 1, color: "#E2E8F0" }],
    categoryBars,
    completionTrend,
  };
}
