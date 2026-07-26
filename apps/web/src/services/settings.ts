import { createAdminClient } from "@/lib/supabase/admin";
import { localGetSettings, localUpdateSettings } from "@/lib/local-store";
import type { SettingsInput, UserSettings } from "@taskflow/shared";

function mapSettings(row: Record<string, unknown>): UserSettings {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    theme: (row.theme as UserSettings["theme"]) ?? "system",
    emailNotifications: Boolean(row.email_notifications ?? row.emailNotifications ?? true),
    pushNotifications: Boolean(row.push_notifications ?? row.pushNotifications ?? true),
    weeklyDigest: Boolean(row.weekly_digest ?? row.weeklyDigest ?? false),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  };
}

export async function getSettings(userId: string): Promise<UserSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error && data) return mapSettings(data as Record<string, unknown>);

    if (!error && !data) {
      const { data: created } = await admin
        .from("user_settings")
        .insert({
          user_id: userId,
          theme: "system",
          email_notifications: true,
          push_notifications: true,
          weekly_digest: false,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (created) return mapSettings(created as Record<string, unknown>);
    }
  } catch (e) {
    console.error("[settings] get failed", e);
  }
  return localGetSettings(userId);
}

export async function updateSettings(userId: string, data: SettingsInput): Promise<UserSettings> {
  try {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          theme: data.theme,
          email_notifications: data.emailNotifications,
          push_notifications: data.pushNotifications,
          weekly_digest: data.weeklyDigest,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("*")
      .single();
    if (!error && row) return mapSettings(row as Record<string, unknown>);
  } catch (e) {
    console.error("[settings] update failed", e);
  }
  return localUpdateSettings(userId, data);
}
