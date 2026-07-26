"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, CategoryInput, Task } from "@taskflow/shared";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/categories";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryModal } from "@/components/categories/category-modal";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/tasks/empty-state";

export function CategoriesShell({
  user,
  categories,
  tasks,
}: {
  user: { fullName: string; role?: string | null; avatarUrl?: string | null };
  categories: Category[];
  tasks: Task[];
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = Object.fromEntries(
    categories.map((c) => [
      c.id,
      tasks.filter((t) => t.categoryId === c.id || t.category === c.name).length,
    ])
  );

  const save = (data: CategoryInput) => {
    startTransition(async () => {
      const result = editing
        ? await updateCategoryAction({ id: editing.id, ...data })
        : await createCategoryAction(data);
      if (!result.success) {
        toast.error(result.error ?? "Failed");
        return;
      }
      toast.success(editing ? "Category updated" : "Category created");
      setOpen(false);
      setEditing(null);
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => {}}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Categories"
          subtitle="Organize work with colorful labels."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <EmptyState title="No categories" description="Create your first category." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <div key={category.id} className="relative">
                  <CategoryCard category={category} taskCount={counts[category.id] ?? 0} />
                  <div className="absolute right-3 top-3 flex gap-1">
                    <button
                      type="button"
                      className="rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm hover:text-indigo-600"
                      onClick={() => {
                        setEditing(category);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!category.isDefault ? (
                      <button
                        type="button"
                        className="rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm hover:text-rose-600"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const result = await deleteCategoryAction(category.id);
                            if (!result.success) toast.error(result.error ?? "Failed");
                            else {
                              toast.success("Category deleted");
                              router.refresh();
                            }
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
      <CategoryModal
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={save}
        title={editing ? "Edit Category" : "Create Category"}
        loading={pending}
      />
    </div>
  );
}
