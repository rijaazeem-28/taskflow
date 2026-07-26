"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRealtimeTasks } from "@/hooks/use-realtime-tasks";
import { LiveIndicator } from "@/components/realtime/live-indicator";

type Props = {
  userId: string;
  /** Show toast when a remote/live change arrives */
  notify?: boolean;
  className?: string;
};

export function RealtimeTasksBridge({ userId, notify = true, className }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const onChange = useCallback(() => {
    startTransition(() => router.refresh());
    if (notify) {
      toast.message("Live update", {
        description: "Tasks refreshed in real time.",
        duration: 2200,
      });
    }
  }, [router, notify]);

  const status = useRealtimeTasks({ userId, onChange });

  return <LiveIndicator status={status} className={className} />;
}
