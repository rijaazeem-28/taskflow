import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { WhiteboardShell } from "@/features/whiteboard/whiteboard-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Whiteboard" };

export default async function WhiteboardPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  return (
    <WhiteboardShell
      user={{
        id: ctx.user.id,
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
    />
  );
}
