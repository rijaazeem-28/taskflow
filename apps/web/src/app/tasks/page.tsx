import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { listTasks } from "@/services/tasks";
import { listCategories } from "@/services/categories";
import { serializeTask } from "@/lib/serialize";
import { WorkspaceShell } from "@/features/tasks/workspace-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default async function TasksPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  const [tasks, categories] = await Promise.all([
    listTasks(ctx.user.id).catch(() => []),
    listCategories(ctx.user.id).catch(() => []),
  ]);

  return (
    <WorkspaceShell
      user={{
        id: ctx.user.id,
        fullName: ctx.profile.fullName,
        bio: ctx.profile.bio ?? "",
        avatarUrl: ctx.profile.avatarUrl,
      }}
      tasks={tasks.map(serializeTask)}
      categories={categories}
    />
  );
}
