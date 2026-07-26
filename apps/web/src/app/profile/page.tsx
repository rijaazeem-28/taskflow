import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { UserProfile } from "@taskflow/shared";
import { getCurrentUserContext } from "@/lib/auth-user";
import { getProfileByUserId } from "@/services/profile";
import { localGetProfile } from "@/lib/local-store";
import { serializeProfile } from "@/lib/serialize";
import { ProfileShell } from "@/features/profile/profile-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  const remote = await getProfileByUserId(ctx.user.id);
  const local = await localGetProfile(ctx.user.id);
  const source = local ?? (remote ? serializeProfile(remote) : ctx.profile);

  const profile: UserProfile = {
    id: source.id,
    userId: source.userId,
    fullName: source.fullName,
    email: source.email,
    avatarUrl: source.avatarUrl ?? null,
    role: source.role ?? "Product Designer",
    bio: ("bio" in source ? source.bio : null) ?? "",
    timezone: ("timezone" in source ? source.timezone : null) ?? "UTC",
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };

  return (
    <ProfileShell
      user={{
        fullName: ctx.profile.fullName,
        bio: ctx.profile.bio ?? "",
        avatarUrl: ctx.profile.avatarUrl,
      }}
      profile={profile}
    />
  );
}
