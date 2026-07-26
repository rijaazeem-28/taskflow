import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { listTasks } from "@/services/tasks";
import { listCategories } from "@/services/categories";
import { serializeTask } from "@/lib/serialize";
import { CategoriesShell } from "@/features/categories/categories-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");
  const [tasks, categories] = await Promise.all([
    listTasks(ctx.user.id).catch(() => []),
    listCategories(ctx.user.id).catch(() => []),
  ]);
  return (
    <CategoriesShell
      user={{
        fullName: ctx.profile.fullName,
        bio: ctx.profile.bio ?? "",
        avatarUrl: ctx.profile.avatarUrl,
      }}
      categories={categories}
      tasks={tasks.map(serializeTask)}
    />
  );
}
