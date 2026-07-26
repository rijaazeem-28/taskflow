"use server";

import { revalidatePath } from "next/cache";
import { categorySchema, updateCategorySchema } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/services/categories";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getCategoriesAction() {
  const userId = await requireUserId();
  return listCategories(userId);
}

export async function createCategoryAction(input: unknown) {
  try {
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0]?.message };
    const userId = await requireUserId();
    const category = await createCategory(userId, parsed.data);
    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true as const, category };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateCategoryAction(input: unknown) {
  try {
    const parsed = updateCategorySchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0]?.message };
    const userId = await requireUserId();
    const category = await updateCategory(userId, parsed.data);
    if (!category) return { success: false as const, error: "Category not found" };
    revalidatePath("/categories");
    revalidatePath("/tasks");
    return { success: true as const, category };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const userId = await requireUserId();
    const category = await deleteCategory(id, userId);
    if (!category) return { success: false as const, error: "Category not found" };
    revalidatePath("/categories");
    revalidatePath("/tasks");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}
