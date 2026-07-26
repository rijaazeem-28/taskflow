import { createClient } from "@/lib/supabase/server";
import { createProfile, getProfileByUserId } from "@/services/profile";
import { AUTH_ENABLED, GUEST_PROFILE, GUEST_USER_ID } from "@/lib/auth-config";
import type { UserProfile } from "@taskflow/shared";

function profileFromAuth(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): UserProfile {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "TaskFlow User";

  const now = new Date().toISOString();

  return {
    id: user.id,
    userId: user.id,
    fullName,
    email: user.email ?? "",
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    role: "Product Designer",
    createdAt: now,
    updatedAt: now,
  };
}

function guestContext() {
  return {
    user: { id: GUEST_USER_ID, email: GUEST_PROFILE.email },
    profile: { ...GUEST_PROFILE } satisfies UserProfile,
  };
}

export async function getCurrentUserContext() {
  if (!AUTH_ENABLED) {
    return guestContext();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    let profile = await getProfileByUserId(user.id);

    if (!profile) {
      profile = await createProfile({
        userId: user.id,
        fullName:
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "TaskFlow User",
        email: user.email ?? "",
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      });
    }

    return {
      user,
      profile: {
        id: profile.id,
        userId: profile.userId,
        fullName: profile.fullName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        createdAt:
          typeof profile.createdAt === "string"
            ? profile.createdAt
            : new Date(profile.createdAt).toISOString(),
        updatedAt:
          typeof profile.updatedAt === "string"
            ? profile.updatedAt
            : new Date(profile.updatedAt).toISOString(),
      } satisfies UserProfile,
    };
  } catch (error) {
    console.error("[auth-user] falling back to auth metadata", error);
    return {
      user,
      profile: profileFromAuth(user),
    };
  }
}

export async function requireUserId() {
  const ctx = await getCurrentUserContext();
  if (!ctx) throw new Error("Unauthorized");
  return ctx.user.id;
}
