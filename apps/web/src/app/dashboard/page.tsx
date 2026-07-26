import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { listTasks } from "@/services/tasks";
import { listCategories } from "@/services/categories";
import { serializeTask } from "@/lib/serialize";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  const [tasks, categories] = await Promise.all([
    listTasks(ctx.user.id).catch(() => []),
    listCategories(ctx.user.id).catch(() => []),
  ]);

  const firstName = ctx.profile.fullName.split(" ")[0] || "there";

  return (
    <DashboardShell
      user={{
        id: ctx.user.id,
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
      tasks={tasks.map(serializeTask)}
      categories={categories}
      firstName={firstName}
    />
  );
}
