"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserProfile } from "@taskflow/shared";
import { changePasswordAction, updateProfileAction } from "@/actions/profile";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProgressCircle } from "@/components/tasks/progress-circle";
import { SettingsCard } from "@/components/settings/settings-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@taskflow/shared";

export function ProfileShell({
  user,
  profile,
}: {
  user: { fullName: string; role?: string | null; avatarUrl?: string | null };
  profile: UserProfile;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fullName: profile.fullName,
    bio: profile.bio ?? "",
    timezone: profile.timezone ?? "UTC",
    avatarUrl: profile.avatarUrl ?? "",
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const completion = useMemo(() => {
    let score = 40;
    if (form.fullName.trim().length > 1) score += 15;
    if (form.bio.trim()) score += 15;
    if (form.timezone) score += 15;
    if (form.avatarUrl.trim()) score += 15;
    return Math.min(100, score);
  }, [form]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => {}}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Profile"
          subtitle="Manage how you appear in TaskFlow."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="mx-auto grid w-full max-w-4xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            <Avatar className="h-16 w-16">
              {form.avatarUrl ? <AvatarImage src={form.avatarUrl} /> : null}
              <AvatarFallback>{getInitials(form.fullName || "TF")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-semibold text-slate-900">{form.fullName}</p>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
            <ProgressCircle value={completion} label="Profile" />
          </div>

          <SettingsCard title="Profile details" description="Visible identity and preferences">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Full name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input value={profile.email} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="A short intro..."
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  value={form.timezone}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  placeholder="UTC"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar URL</Label>
                <Input
                  value={form.avatarUrl}
                  onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button
              className="mt-4"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateProfileAction(form);
                  if (!result.success) toast.error(result.error ?? "Failed");
                  else {
                    toast.success("Profile saved");
                    router.refresh();
                  }
                })
              }
            >
              Save profile
            </Button>
          </SettingsCard>

          <SettingsCard title="Change password" description="Keep your account secure">
            <div className="grid gap-3">
              <Input
                type="password"
                placeholder="Current password"
                value={password.currentPassword}
                onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="New password"
                value={password.newPassword}
                onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={password.confirmPassword}
                onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
              <Button
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await changePasswordAction(password);
                    if (!result.success) toast.error(result.error ?? "Failed");
                    else {
                      toast.success("Password updated");
                      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }
                  })
                }
              >
                Update password
              </Button>
            </div>
          </SettingsCard>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
