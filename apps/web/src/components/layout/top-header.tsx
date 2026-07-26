"use client";

import { useEffect, useState } from "react";
import { LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials } from "@taskflow/shared";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { logoutAction } from "@/actions/auth";
import Link from "next/link";

type TopHeaderProps = {
  title: string;
  subtitle?: string;
  userName: string;
  avatarUrl?: string | null;
  onMenuClick: () => void;
};

export function TopHeader({
  title,
  subtitle,
  userName,
  avatarUrl,
  onMenuClick,
}: TopHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100/80 bg-background/85 backdrop-blur-xl dark:border-slate-800">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative mx-auto hidden w-full max-w-md md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tasks, projects..."
              className="h-11 rounded-2xl border-slate-200/80 bg-white pl-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <NotificationBell />

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-indigo-300"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {!mounted ? (
                <Sun className="h-[18px] w-[18px] opacity-50" />
              ) : isDark ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500">
                <Avatar className="h-10 w-10 shadow-sm ring-2 ring-white dark:ring-slate-700">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName} /> : null}
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{userName}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-700"
                  onSelect={(e) => {
                    e.preventDefault();
                    void logoutAction();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative md:hidden">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tasks, projects..."
            className="h-11 rounded-2xl border-slate-200/80 bg-white pl-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] dark:text-slate-50">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 sm:text-[15px] dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
