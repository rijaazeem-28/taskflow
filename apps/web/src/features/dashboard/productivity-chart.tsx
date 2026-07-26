"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Task } from "@taskflow/shared";
import { buildAnalytics } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = ["#F472B6", "#A78BFA", "#818CF8", "#60A5FA", "#F472B6", "#C084FC", "#6366F1"];

export function ProductivityChart({
  score,
  tasks = [],
}: {
  score?: number;
  tasks?: Task[];
}) {
  const analytics = useMemo(() => buildAnalytics(tasks), [tasks]);
  const data = analytics.weeklyLine.map((d) => ({
    day: d.day,
    value: Math.min(100, d.completed * 20 + d.created * 8),
  }));
  const displayScore = score ?? analytics.productivityScore;

  return (
    <Card className="h-full">
      <CardHeader className="p-5 pb-2">
        <CardTitle>Productivity</CardTitle>
        <p className="text-sm text-slate-500">
          <span className="text-2xl font-bold text-slate-900">{displayScore}%</span>{" "}
          {displayScore >= 70 ? "Great progress!" : displayScore >= 40 ? "Keep going!" : "Let’s build momentum"}
        </p>
      </CardHeader>
      <CardContent className="h-[240px] p-5 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={18}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
            />
            <ReferenceLine
              y={80}
              stroke="#94A3B8"
              strokeDasharray="4 4"
              label={{ value: "Goal 80%", position: "insideTopRight", fill: "#94A3B8", fontSize: 11 }}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} name="Score">
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
