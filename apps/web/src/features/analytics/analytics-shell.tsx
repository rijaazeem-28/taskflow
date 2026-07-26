"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  FolderKanban,
  Gauge,
  Percent,
  PlusCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { Task } from "@taskflow/shared";
import { buildAnalytics } from "@/lib/analytics";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { StatisticCard } from "@/components/tasks/statistic-card";
import { EmptyState } from "@/components/tasks/empty-state";
import { LoadingSkeleton } from "@/components/tasks/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";

const AnalyticsCharts = dynamic(
  () => import("./analytics-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => <LoadingSkeleton variant="charts" />,
  }
);

type Props = {
  user: { fullName: string; bio?: string | null;
    role?: string | null; avatarUrl?: string | null };
  tasks: Task[];
};

function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full overflow-hidden">
        <CardContent className="flex items-start gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold text-slate-900">{value}</p>
            {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AnalyticsShell({ user, tasks }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const analytics = useMemo(() => buildAnalytics(tasks), [tasks]);

  const stats = [
    { title: "Daily completed", value: analytics.dailyCompleted, icon: Sparkles },
    { title: "Weekly completed", value: analytics.weeklyCompleted, icon: CalendarDays },
    { title: "Monthly completed", value: analytics.monthlyCompleted, icon: BarChart3 },
    { title: "Tasks completed", value: analytics.tasksCompleted, icon: CheckCircle2 },
    { title: "Created (week)", value: analytics.tasksCreatedWeek, icon: PlusCircle },
    { title: "Pending", value: analytics.pending, icon: Clock3 },
    { title: "Overdue", value: analytics.overdue, icon: AlertTriangle },
    { title: "Completion", value: analytics.completionRate, suffix: "%", icon: Percent },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setQuickAddOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Analytics"
          subtitle="Productivity trends from your real tasks."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <PageTransition className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          {tasks.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No analytics yet"
              description="Create and complete tasks to unlock charts, streaks, and productivity insights."
              action={
                <Button onClick={() => setQuickAddOpen(true)}>
                  <PlusCircle className="h-4 w-4" />
                  Create your first task
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <StatisticCard
                      title={item.title}
                      value={item.value}
                      suffix={"suffix" in item ? item.suffix : undefined}
                      icon={item.icon}
                    />
                  </motion.div>
                ))}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">Productivity insights</h2>
                  <Link
                    href="/activity"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Activity className="h-4 w-4" />
                    View activity
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile
                    label="Productivity score"
                    value={analytics.productivityScore}
                    hint="Weighted completion + streak"
                    icon={Gauge}
                    delay={0.05}
                  />
                  <MetricTile
                    label="Current streak"
                    value={`${analytics.currentStreak}d`}
                    hint={`Longest ${analytics.longestStreak}d`}
                    icon={Flame}
                    delay={0.08}
                  />
                  <MetricTile
                    label="Avg completion time"
                    value={`${analytics.averageCompletionHours}h`}
                    hint="From create to done"
                    icon={Clock3}
                    delay={0.11}
                  />
                  <MetricTile
                    label="Finished today"
                    value={analytics.finishedToday}
                    hint={`${analytics.todayProgress}% of today's due`}
                    icon={Trophy}
                    delay={0.14}
                  />
                  <MetricTile
                    label="Avg tasks / day"
                    value={analytics.averageTasksPerDay}
                    hint="Last 30 days"
                    icon={Target}
                    delay={0.17}
                  />
                  <MetricTile
                    label="Overdue rate"
                    value={`${analytics.overduePercentage}%`}
                    hint="Of all tasks"
                    icon={AlertTriangle}
                    delay={0.2}
                  />
                  <MetricTile
                    label="Most productive day"
                    value={analytics.mostProductiveDay}
                    icon={CalendarDays}
                    delay={0.23}
                  />
                  <MetricTile
                    label="Top category"
                    value={analytics.mostUsedCategory}
                    hint={`Priority: ${analytics.mostUsedPriority}`}
                    icon={FolderKanban}
                    delay={0.26}
                  />
                </div>
              </div>

              <Card>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-base">Today&apos;s progress</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Due tasks completed</span>
                    <span className="font-semibold text-slate-900">{analytics.todayProgress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${analytics.todayProgress}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </CardContent>
              </Card>

              <AnalyticsCharts data={analytics} />
            </>
          )}
        </PageTransition>
      </div>
      <BottomNav />
      <TaskFormDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
