"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Loader,
  Percent,
  Sparkles,
} from "lucide-react";
import type { TaskStats } from "@taskflow/shared";
import { StatisticCard } from "@/components/tasks/statistic-card";
import { ProgressCircle } from "@/components/tasks/progress-circle";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCards({ stats }: { stats: TaskStats }) {
  const items = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: ClipboardList,
      tone: "violet" as const,
      change: stats.totalChange,
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      tone: "emerald" as const,
      change: stats.completedChange,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Loader,
      tone: "amber" as const,
      change: stats.inProgressChange,
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: CircleDashed,
      tone: "pink" as const,
      change: stats.pendingChange,
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      tone: "red" as const,
    },
    {
      title: "Today",
      value: stats.today,
      icon: Sparkles,
      tone: "violet" as const,
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      icon: CalendarClock,
      tone: "amber" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <StatisticCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              change={item.change}
            />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <Card>
          <CardContent className="flex items-center gap-5 p-5">
            <ProgressCircle value={stats.completionRate} size={96} label="Done" />
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Percent className="h-4 w-4" /> Completion rate
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stats.completionRate}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {items.slice(4).map((item) => (
          <StatisticCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </div>
    </div>
  );
}
