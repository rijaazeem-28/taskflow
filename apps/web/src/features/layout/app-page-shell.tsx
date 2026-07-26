"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  user: {
    fullName: string;
    role?: string | null;
    avatarUrl?: string | null;
  };
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export function AppPageShell({ user, title, subtitle, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setQuickAddOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          title={title}
          subtitle={subtitle}
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {children ?? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-lg font-semibold text-slate-800">{title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  This section is ready for Phase 2 — navigation and layout already match TaskFlow.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      <TaskFormDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
