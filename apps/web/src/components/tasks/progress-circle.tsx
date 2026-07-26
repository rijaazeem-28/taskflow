"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ProgressCircleProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  showValue?: boolean;
};

export function ProgressCircle({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  className,
  label,
  showValue = true,
}: ProgressCircleProps) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const spring = useSpring(0, { stiffness: 80, damping: 18 });
  useEffect(() => {
    spring.set(percent);
  }, [percent, spring]);

  const dashOffset = useTransform(spring, (p) => circumference - (p / 100) * circumference);
  const display = useTransform(spring, (p) => `${Math.round(p)}%`);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-2", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      {showValue ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-xl font-bold text-slate-900">{display}</motion.span>
          {label ? <span className="text-[10px] font-medium text-slate-500">{label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
