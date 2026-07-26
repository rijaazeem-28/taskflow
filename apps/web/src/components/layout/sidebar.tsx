"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronDown,
  Crown,
  Kanban,
  LayoutDashboard,
  PenTool,
  Plus,
  Settings,
  Tags,
  User,
  X,
} from "lucide-react";
import { SIDEBAR_NAV, getInitials } from "@taskflow/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/layout/logout-button";

const icons = {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Calendar,
  Tags,
  PenTool,
  BarChart3,
  Activity,
  User,
  Settings,
} as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onQuickAdd: () => void;
  user: {
    fullName: string;
    bio?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  };
};

export function Sidebar({ open, onClose, onQuickAdd, user }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <aside className="flex h-full w-[260px] flex-col bg-[linear-gradient(180deg,#1E1B4B_0%,#312E81_55%,#4C1D95_100%)] text-white">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <CheckSquare className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {SIDEBAR_NAV.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? LayoutDashboard;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-violet-500 shadow-[0_8px_20px_rgba(139,92,246,0.35)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 px-4 pb-5 pt-2">
        <Button
          variant="gradient"
          className="h-12 w-full justify-center rounded-2xl text-sm font-semibold shadow-[0_10px_24px_rgba(236,72,153,0.35)]"
          onClick={() => {
            onQuickAdd();
            onClose();
          }}
        >
          <Plus className="h-4 w-4" />
          Quick Add Task
        </Button>

        <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(99,102,241,0.45),rgba(236,72,153,0.35))] p-4 ring-1 ring-white/10">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
            <Crown className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">Upgrade to Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Unlock unlimited projects, analytics & team seats.
          </p>
          <Button variant="upgrade" size="sm" className="mt-3 w-full rounded-xl">
            Upgrade Now
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
            <Avatar className="h-10 w-10 ring-2 ring-white/20">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.fullName} /> : null}
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-white/60">
                {user.bio?.trim() || "No bio yet"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </div>

          <LogoutButton className="bg-white/10 text-white hover:bg-rose-500/90 hover:text-white ring-1 ring-white/10" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden h-screen shrink-0 lg:sticky lg:top-0 lg:block">{content}</div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {content}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
