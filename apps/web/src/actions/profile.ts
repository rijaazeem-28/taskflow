"use server";

import { revalidatePath } from "next/cache";
import { changePasswordSchema, profileUpdateSchema, settingsSchema } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canUseLocalStore } from "@/lib/runtime";
import { createProfile, getProfileByUserId } from "@/services/profile";
import { getSettings, updateSettings } from "@/services/settings";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function updateProfileAction(input: unknown) {
  try {
    const parsed = profileUpdateSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0]?.message };
    const { user } = await requireUser();

    const saved = await createProfile({
      userId: user.id,
      fullName: parsed.data.fullName,
      email: user.email ?? "",
      avatarUrl: parsed.data.avatarUrl || null,
      bio: parsed.data.bio ?? "",
      timezone: parsed.data.timezone ?? "UTC",
    });

    // Ensure bio/timezone persisted when columns exist (createProfile may fall back to base columns).
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({
          bio: parsed.data.bio ?? "",
          timezone: parsed.data.timezone ?? "UTC",
          full_name: parsed.data.fullName,
          avatar_url: parsed.data.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error && /bio|timezone|column/i.test(error.message)) {
        return {
          success: false as const,
          error:
            "Bio/timezone columns are missing. Run apps/web/supabase/schema-phase2.sql in the Supabase SQL Editor.",
        };
      }
      if (error) {
        return { success: false as const, error: error.message };
      }
    } catch (e) {
      if (!canUseLocalStore()) {
        return {
          success: false as const,
          error: e instanceof Error ? e.message : "Failed to save profile",
        };
      }
    }

    if (canUseLocalStore()) {
      const { localUpsertProfile } = await import("@/lib/local-store");
      await localUpsertProfile({
        userId: user.id,
        fullName: parsed.data.fullName,
        email: user.email ?? "",
        avatarUrl: parsed.data.avatarUrl || null,
        bio: parsed.data.bio ?? "",
        timezone: parsed.data.timezone ?? "UTC",
      }).catch(() => undefined);
    }

    const { logActivity } = await import("@/lib/activity-store");
    await logActivity(user.id, {
      type: "profile_updated",
      title: "Profile updated",
      description: "Your profile details were saved",
    }).catch(() => undefined);

    revalidatePath("/profile");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true as const, profile: saved };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function changePasswordAction(input: unknown) {
  try {
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0]?.message };
    const { supabase, user } = await requireUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: parsed.data.currentPassword,
    });
    if (signInError) return { success: false as const, error: "Current password is incorrect" };
    const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const, message: "Password updated" };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateSettingsAction(input: unknown) {
  try {
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0]?.message };
    const { user } = await requireUser();
    const settings = await updateSettings(user.id, parsed.data);
    revalidatePath("/settings");
    return { success: true as const, settings };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getSettingsAction() {
  const { user } = await requireUser();
  return getSettings(user.id);
}

export async function deleteAccountAction() {
  try {
    const { user } = await requireUser();
    const admin = createAdminClient();
    await admin.from("tasks").delete().eq("user_id", user.id);
    await admin.from("categories").delete().eq("user_id", user.id);
    await admin.from("user_settings").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("user_id", user.id);
    await admin.auth.admin.deleteUser(user.id);
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getProfileAction() {
  const { user } = await requireUser();
  let profile = await getProfileByUserId(user.id);
  if (!profile) {
    profile = await createProfile({
      userId: user.id,
      fullName: (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
    });
  }
  return profile;
}
