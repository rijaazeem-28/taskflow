"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { tasksRealtimeChannel } from "@/lib/realtime-tasks";

export type RealtimeStatus = "connecting" | "live" | "error" | "off";

type Options = {
  userId?: string | null;
  enabled?: boolean;
  onChange: () => void;
};

/**
 * Live task updates via Supabase Realtime:
 * - postgres_changes on public.tasks (other devices / DB writes)
 * - broadcast event tasks-changed (same-account tabs / local mutations)
 */
export function useRealtimeTasks({ userId, enabled = true, onChange }: Options) {
  const [status, setStatus] = useState<RealtimeStatus>("off");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled || !userId) {
      setStatus("off");
      return;
    }

    const supabase = createClient();
    setStatus("connecting");

    let debounce: ReturnType<typeof setTimeout> | null = null;
    const emit = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => onChangeRef.current(), 120);
    };

    const channel = supabase
      .channel(tasksRealtimeChannel(userId), {
        config: { broadcast: { self: false } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${userId}`,
        },
        () => emit()
      )
      .on("broadcast", { event: "tasks-changed" }, () => emit())
      .subscribe((next) => {
        if (next === "SUBSCRIBED") setStatus("live");
        else if (next === "CHANNEL_ERROR" || next === "TIMED_OUT") setStatus("error");
        else if (next === "CLOSED") setStatus("off");
        else setStatus("connecting");
      });

    return () => {
      if (debounce) clearTimeout(debounce);
      void supabase.removeChannel(channel);
    };
  }, [userId, enabled]);

  return status;
}
