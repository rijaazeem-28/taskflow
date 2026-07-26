"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type StatisticCardProps = {
  title: string;
  value: number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
};

export function StatisticCard({
  title,
  value,
  suffix,
  change,
  changeLabel,
  icon: Icon,
  iconClassName,
  className,
}: StatisticCardProps) {
  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  const changePositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={cn(
          "overflow-hidden border-slate-100 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(99,102,241,0.12)]",
          className
        )}
      >
        <CardContent className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="flex items-baseline gap-1 text-2xl font-bold tracking-tight text-slate-900">
              <motion.span>{display}</motion.span>
              {suffix ? <span className="text-base font-semibold text-slate-400">{suffix}</span> : null}
            </p>
            {change !== undefined ? (
              <p
                className={cn(
                  "text-xs font-medium",
                  changePositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {changePositive ? "+" : ""}
                {change}%
                {changeLabel ? ` ${changeLabel}` : " vs last week"}
              </p>
            ) : null}
          </div>
          {Icon ? (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.15)]",
                iconClassName
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
