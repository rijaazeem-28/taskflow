"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { STATUS_COLORS, STATUS_LABELS, percent, type TaskStats } from "@taskflow/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TasksOverview({ stats }: { stats: TaskStats }) {
  const segments = [
    { key: "COMPLETED" as const, value: stats.completed },
    { key: "IN_PROGRESS" as const, value: stats.inProgress },
    { key: "TODO" as const, value: stats.pending },
    { key: "ON_HOLD" as const, value: stats.onHold },
    { key: "CANCELLED" as const, value: stats.cancelled },
  ].filter((s) => s.value > 0);

  const data =
    segments.length > 0
      ? segments
      : [{ key: "TODO" as const, value: 1 }];

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-2">
        <CardTitle>Tasks Overview</CardTitle>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 pt-2 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="relative mx-auto h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
        </div>

        <ul className="space-y-2.5">
          {(
            [
              "COMPLETED",
              "IN_PROGRESS",
              "TODO",
              "ON_HOLD",
              "CANCELLED",
            ] as const
          ).map((key) => {
            const value =
              key === "COMPLETED"
                ? stats.completed
                : key === "IN_PROGRESS"
                  ? stats.inProgress
                  : key === "TODO"
                    ? stats.pending
                    : key === "ON_HOLD"
                      ? stats.onHold
                      : stats.cancelled;
            return (
              <li key={key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[key] }}
                  />
                  {STATUS_LABELS[key]}
                </span>
                <span className="font-semibold text-slate-800">
                  {value}{" "}
                  <span className="font-normal text-slate-400">
                    ({percent(value, stats.total || 1)}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
