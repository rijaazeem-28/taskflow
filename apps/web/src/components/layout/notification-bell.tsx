"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { relativeTime } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppNotification = {
  id: string;
  type: "overdue" | "due_today" | "reminder" | "activity";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

const READ_KEY = "taskflow:notifications:read";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-200)));
}

const typeTone: Record<AppNotification["type"], string> = {
  overdue: "bg-rose-50 text-rose-600",
  due_today: "bg-amber-50 text-amber-700",
  reminder: "bg-sky-50 text-sky-700",
  activity: "bg-indigo-50 text-indigo-700",
};

export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const unread = items.filter((n) => !readIds.has(n.id)).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { notifications?: AppNotification[] };
      setItems(data.notifications ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setReadIds(loadReadIds());
    void fetchNotifications();
  }, [fetchNotifications]);

  // Live refresh when tasks change
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) return;

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `user_id=eq.${user.id}`,
          },
          () => void fetchNotifications()
        )
        .on("broadcast", { event: "tasks-changed" }, () => void fetchNotifications())
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const markAllRead = () => {
    const next = new Set(readIds);
    for (const item of items) next.add(item.id);
    setReadIds(next);
    saveReadIds(next);
  };

  const markOneRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(next);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:text-indigo-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
            disabled={unread === 0}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-[360px] overflow-y-auto py-1">
          {loading ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">
              You’re all caught up — no notifications.
            </p>
          ) : (
            items.map((item) => {
              const unreadItem = !readIds.has(item.id);
              return (
                <DropdownMenuItem
                  key={item.id}
                  asChild
                  className={cn(
                    "cursor-pointer rounded-none px-3 py-2.5 focus:bg-slate-50",
                    unreadItem && "bg-indigo-50/40"
                  )}
                  onSelect={() => markOneRead(item.id)}
                >
                  <Link href={item.href} className="flex w-full items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 rounded-lg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        typeTone[item.type]
                      )}
                    >
                      {item.type === "due_today" ? "due" : item.type}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {relativeTime(item.createdAt)}
                      </span>
                    </span>
                    {unreadItem ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    ) : null}
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem asChild className="justify-center rounded-none py-2.5 text-xs font-semibold text-indigo-600">
          <Link href="/activity">View activity</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
