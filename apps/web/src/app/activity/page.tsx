import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { getActivityAction } from "@/actions/activity";
import { ActivityShell } from "@/features/activity/activity-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  const { events } = await getActivityAction();

  return (
    <ActivityShell
      user={{
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
      events={events}
    />
  );
}
