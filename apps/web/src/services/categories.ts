import { createAdminClient } from "@/lib/supabase/admin";
import { canUseLocalStore } from "@/lib/runtime";
import {
  localCreateCategory,
  localDeleteCategory,
  localEnsureCategories,
  localListCategories,
  localUpdateCategory,
} from "@/lib/local-store";
import type { Category, CategoryInput, UpdateCategoryInput } from "@taskflow/shared";
import { DEFAULT_CATEGORIES } from "@taskflow/shared";

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    name: String(row.name),
    color: String(row.color),
    icon: String(row.icon),
    isDefault: Boolean(row.is_default ?? row.isDefault),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  };
}

export async function listCategories(userId: string): Promise<Category[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (!error && data && data.length > 0) {
      return data.map((r) => mapCategory(r as Record<string, unknown>));
    }

    if (!error && data && data.length === 0) {
      // seed defaults remotely
      const rows = DEFAULT_CATEGORIES.map((c) => ({
        user_id: userId,
        name: c.name,
        color: c.color,
        icon: c.icon,
        is_default: true,
        updated_at: new Date().toISOString(),
      }));
      const { data: seeded } = await admin.from("categories").insert(rows).select("*");
      if (seeded?.length) return seeded.map((r) => mapCategory(r as Record<string, unknown>));
    }
  } catch (e) {
    console.error("[categories] list failed", e);
    if (!canUseLocalStore()) throw e;
  }

  if (!canUseLocalStore()) return [];
  await localEnsureCategories(userId);
  return localListCategories(userId);
}

export async function createCategory(userId: string, data: CategoryInput) {
  try {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("categories")
      .insert({
        user_id: userId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (!error && row) return mapCategory(row as Record<string, unknown>);
    if (error && !canUseLocalStore()) throw new Error(error.message);
  } catch (e) {
    console.error("[categories] create failed", e);
    if (!canUseLocalStore()) throw e;
  }
  return localCreateCategory(userId, data);
}

export async function updateCategory(userId: string, data: UpdateCategoryInput) {
  try {
    const admin = createAdminClient();
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.color !== undefined) payload.color = data.color;
    if (data.icon !== undefined) payload.icon = data.icon;
    const { data: row, error } = await admin
      .from("categories")
      .update(payload)
      .eq("id", data.id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (!error && row) return mapCategory(row as Record<string, unknown>);
    if (error && !canUseLocalStore()) throw new Error(error.message);
  } catch (e) {
    console.error("[categories] update failed", e);
    if (!canUseLocalStore()) throw e;
  }
  return localUpdateCategory(userId, data);
}

export async function deleteCategory(id: string, userId: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("categories").delete().eq("id", id).eq("user_id", userId);
    if (!error) {
      if (canUseLocalStore()) {
        const local = await localDeleteCategory(id, userId);
        return local ?? ({ id } as Category);
      }
      return { id } as Category;
    }
    if (error && !canUseLocalStore()) throw new Error(error.message);
  } catch (e) {
    console.error("[categories] delete failed", e);
    if (!canUseLocalStore()) throw e;
  }
  return localDeleteCategory(id, userId);
}
