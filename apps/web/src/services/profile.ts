import type { UserProfile } from "@taskflow/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { canUseLocalStore } from "@/lib/runtime";
import { localGetProfile, localUpsertProfile } from "@/lib/local-store";

export type DbProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string | null;
  bio: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileWriteInput = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  timezone?: string | null;
  role?: string | null;
};

function fromUserProfile(profile: UserProfile): DbProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl ?? null,
    role: profile.role ?? "Product Designer",
    bio: profile.bio ?? null,
    timezone: profile.timezone ?? "UTC",
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function mapProfile(row: Record<string, unknown>): DbProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    fullName: String(row.full_name ?? row.fullName),
    email: String(row.email),
    avatarUrl: ((row.avatar_url ?? row.avatarUrl) as string | null) ?? null,
    role: (row.role as string | null) ?? "Product Designer",
    bio: (row.bio as string | null) ?? null,
    timezone: (row.timezone as string | null) ?? "UTC",
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  };
}

export async function getProfileByUserId(userId: string): Promise<DbProfile | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) return mapProfile(data as Record<string, unknown>);
  } catch (e) {
    console.error("[profile] supabase get failed", e);
  }

  if (!canUseLocalStore()) return null;
  const local = await localGetProfile(userId);
  return local ? fromUserProfile(local) : null;
}

export async function createProfile(data: ProfileWriteInput): Promise<DbProfile> {
  const base = {
    user_id: data.userId,
    full_name: data.fullName,
    email: data.email,
    avatar_url: data.avatarUrl ?? null,
    role: data.role ?? "Product Designer",
    updated_at: new Date().toISOString(),
  };

  const full = {
    ...base,
    bio: data.bio ?? "",
    timezone: data.timezone ?? "UTC",
  };

  try {
    const admin = createAdminClient();
    let { data: row, error } = await admin
      .from("profiles")
      .upsert(full, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      ({ data: row, error } = await admin
        .from("profiles")
        .upsert(base, { onConflict: "user_id" })
        .select("*")
        .single());
    }

    if (!error && row) {
      return mapProfile(row as Record<string, unknown>);
    }
    console.error("[profile] supabase upsert failed", error?.message);
    if (!canUseLocalStore()) {
      throw new Error(error?.message ?? "Failed to save profile");
    }
  } catch (e) {
    console.error("[profile] supabase upsert exception", e);
    if (!canUseLocalStore()) {
      throw e instanceof Error ? e : new Error("Failed to save profile");
    }
  }

  return fromUserProfile(
    await localUpsertProfile({
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      timezone: data.timezone,
      role: data.role,
    })
  );
}
