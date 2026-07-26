import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { listTasks } from "@/services/tasks";
import { serializeTask } from "@/lib/serialize";
import { AnalyticsShell } from "@/features/analytics/analytics-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  const tasks = await listTasks(ctx.user.id).catch(() => []);

  return (
    <AnalyticsShell
      user={{
        fullName: ctx.profile.fullName,
        bio: ctx.profile.bio ?? "",
        avatarUrl: ctx.profile.avatarUrl,
      }}
      tasks={tasks.map(serializeTask)}
    />
  );
}
