"use client";

import { createClient } from "@/lib/supabase/client";

export function tasksRealtimeChannel(userId: string) {
  return `taskflow-tasks:${userId}`;
}

/** Notify other open tabs/clients that tasks changed (Supabase Broadcast). */
export async function publishTasksChanged(userId: string, reason = "update") {
  const supabase = createClient();
  const channel = supabase.channel(tasksRealtimeChannel(userId), {
    config: { broadcast: { self: false } },
  });

  await new Promise<void>((resolve) => {
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") resolve();
    });
  });

  await channel.send({
    type: "broadcast",
    event: "tasks-changed",
    payload: { reason, at: new Date().toISOString() },
  });

  await supabase.removeChannel(channel);
}
