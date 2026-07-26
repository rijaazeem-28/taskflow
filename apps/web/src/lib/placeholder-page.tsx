import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth-user";
import { AppPageShell } from "@/features/layout/app-page-shell";

export async function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect("/login");

  return (
    <AppPageShell
      user={{
        fullName: ctx.profile.fullName,
        role: ctx.profile.role,
        avatarUrl: ctx.profile.avatarUrl,
      }}
      title={title}
      subtitle={subtitle}
    />
  );
}
