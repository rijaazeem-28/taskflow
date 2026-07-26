import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { listTasks } from "@/services/tasks";
import { listCategories } from "@/services/categories";
import { serializeTask } from "@/lib/serialize";
import { CalendarShell } from "@/features/calendar/calendar-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");
  const [tasks, categories] = await Promise.all([
    listTasks(ctx.user.id).catch(() => []),
    listCategories(ctx.user.id).catch(() => []),
  ]);
  return (
    <CalendarShell
      user={{
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
      tasks={tasks.map(serializeTask)}
      categories={categories}
    />
  );
}
