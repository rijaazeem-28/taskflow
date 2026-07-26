import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { getSettings } from "@/services/settings";
import { SettingsShell } from "@/features/settings/settings-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");
  const settings = await getSettings(ctx.user.id);
  return (
    <SettingsShell
      user={{
        fullName: ctx.profile.fullName,
        bio: ctx.profile.bio ?? "",
        avatarUrl: ctx.profile.avatarUrl,
      }}
      settings={settings}
    />
  );
}
