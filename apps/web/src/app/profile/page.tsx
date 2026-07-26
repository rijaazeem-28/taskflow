import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  const profile = local ?? (remote ? serializeProfile(remote) : ctx.profile);

  return (
    <ProfileShell
      user={{
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
      profile={{
        ...profile,
        bio: profile.bio ?? "",
        timezone: profile.timezone ?? "UTC",
      }}
    />
  );
}
