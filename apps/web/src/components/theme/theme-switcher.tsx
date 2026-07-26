"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThemePreference } from "@taskflow/shared";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export type ThemeSwitcherProps = {
  className?: string;
  onChange?: (theme: ThemePreference) => void;
};

export function ThemeSwitcher({ className, onChange }: ThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn("h-11 rounded-2xl bg-slate-100 animate-pulse", className)} aria-hidden />
    );
  }

  const current = (theme ?? "system") as ThemePreference;

  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/80",
        className
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map(({ value, label, Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setTheme(value);
              onChange?.(value);
            }}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
          >
            {active ? (
              <motion.span
                layoutId="theme-switcher-pill"
                className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-100 dark:bg-slate-800 dark:ring-indigo-900"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
            {value === "system" && active ? (
              <span className="relative z-10 text-[10px] text-slate-400 sm:hidden">
                ({resolvedTheme})
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
