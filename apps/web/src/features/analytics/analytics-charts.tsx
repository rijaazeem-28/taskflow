"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsSnapshot } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  background: "white",
};

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="h-[260px] p-5 pt-2">{children}</CardContent>
    </Card>
  );
}

export const AnalyticsCharts = memo(function AnalyticsCharts({
  data,
}: {
  data: AnalyticsSnapshot;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ChartCard title="Weekly completion" subtitle="Created vs completed last 7 days">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.weeklyLine}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} name="Completed" />
            <Line type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Created" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly creation" subtitle="Tasks per week (last 4 weeks)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.monthlyBars} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="created" fill="#6366F1" radius={[8, 8, 0, 0]} name="Created" />
            <Bar dataKey="completed" fill="#A78BFA" radius={[8, 8, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Status distribution" subtitle="Share of tasks by status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.statusDonut} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3} strokeWidth={0}>
              {data.statusDonut.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Priority mix" subtitle="Distribution by priority">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.priorityPie} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={2} strokeWidth={0}>
              {data.priorityPie.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Category breakdown" subtitle="Top categories by task count">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.categoryBars} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="#EC4899" radius={[0, 8, 8, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Completion trend" subtitle="Daily completion rate (%)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.completionTrend}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="rate" stroke="#8B5CF6" fill="url(#trendFill)" strokeWidth={2.5} name="Rate %" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
});
