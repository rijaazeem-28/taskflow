"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Puzzle } from "lucide-react";
import { toast } from "sonner";
import type { UserSettings } from "@taskflow/shared";
import { deleteAccountAction, updateSettingsAction } from "@/actions/profile";
import { logoutAction } from "@/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SettingsCard } from "@/components/settings/settings-card";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SettingsShell({
  user,
  settings,
}: {
  user: { fullName: string; bio?: string | null;
    role?: string | null; avatarUrl?: string | null };
  settings: UserSettings;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(settings);
  const [pending, startTransition] = useTransition();
  const [extensionToken, setExtensionToken] = useState<string | null>(null);
  const [tokenBusy, setTokenBusy] = useState(false);

  const save = () =>
    startTransition(async () => {
      const result = await updateSettingsAction({
        theme: form.theme,
        emailNotifications: form.emailNotifications,
        pushNotifications: form.pushNotifications,
        weeklyDigest: form.weeklyDigest,
      });
      if (!result.success) toast.error(result.error ?? "Failed");
      else {
        toast.success("Settings saved");
        router.refresh();
      }
    });

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
          title="Settings"
          subtitle="General, notifications, appearance, and account."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="mx-auto grid w-full max-w-3xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <SettingsCard title="Appearance" description="Theme preference">
            <ThemeSwitcher onChange={(theme) => setForm((f) => ({ ...f, theme }))} />
          </SettingsCard>

          <SettingsCard title="Notifications" description="How TaskFlow keeps you in the loop">
            {(
              [
                ["emailNotifications", "Email notifications"],
                ["pushNotifications", "Push notifications"],
                ["weeklyDigest", "Weekly digest"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                />
              </label>
            ))}
            <Button className="mt-2" onClick={save} disabled={pending}>
              Save preferences
            </Button>
          </SettingsCard>

          <SettingsCard title="Privacy" description="Your data stays scoped to your account">
            <p className="text-sm text-slate-500">
              Tasks, categories, and reminders are private to your user ID. No other account can
              access them.
            </p>
          </SettingsCard>

          <SettingsCard
            title="Chrome extension"
            description="Connect the TaskFlow extension for quick capture from any page"
          >
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <Puzzle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                Load unpacked from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">apps/extension</code>,
                then paste a token below into the extension Options page.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={tokenBusy}
                  onClick={async () => {
                    setTokenBusy(true);
                    try {
                      const res = await fetch("/api/extension/token", { method: "POST" });
                      const data = (await res.json()) as { token?: string; error?: string };
                      if (!res.ok || !data.token) {
                        toast.error(data.error ?? "Could not create token");
                        return;
                      }
                      setExtensionToken(data.token);
                      toast.success("Extension token created");
                    } catch {
                      toast.error("Could not create token");
                    } finally {
                      setTokenBusy(false);
                    }
                  }}
                >
                  Generate token
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={tokenBusy}
                  onClick={async () => {
                    setTokenBusy(true);
                    try {
                      await fetch("/api/extension/token", { method: "DELETE" });
                      setExtensionToken(null);
                      toast.success("Extension token revoked");
                    } catch {
                      toast.error("Could not revoke token");
                    } finally {
                      setTokenBusy(false);
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
              {extensionToken ? (
                <div className="space-y-2">
                  <Label htmlFor="ext-token">Your token (copy once)</Label>
                  <div className="flex gap-2">
                    <Input id="ext-token" readOnly value={extensionToken} className="font-mono text-xs" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Copy token"
                      onClick={async () => {
                        await navigator.clipboard.writeText(extensionToken);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </SettingsCard>

          <SettingsCard title="Account" description="Session controls">
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </SettingsCard>

          <SettingsCard title="Danger zone" description="Irreversible actions">
            <Label className="text-rose-600">Delete account</Label>
            <p className="mb-3 mt-1 text-sm text-slate-500">
              Permanently remove your profile, tasks, and settings.
            </p>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!confirm("Delete your account permanently?")) return;
                startTransition(async () => {
                  const result = await deleteAccountAction();
                  if (!result.success) toast.error(result.error ?? "Failed");
                  else {
                    toast.success("Account deleted");
                    router.push("/signup");
                  }
                });
              }}
            >
              Delete account
            </Button>
          </SettingsCard>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
