"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Kanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { MOBILE_NAV } from "@taskflow/shared";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Calendar,
  Settings,
} as const;

export type BottomNavProps = {
  className?: string;
};

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden",
        className
      )}
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
        {MOBILE_NAV.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboard;
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2.5 text-[10px] font-semibold transition-colors",
                  active ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-1 rounded-2xl bg-indigo-50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="relative z-10 h-5 w-5" strokeWidth={active ? 2.25 : 2} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
