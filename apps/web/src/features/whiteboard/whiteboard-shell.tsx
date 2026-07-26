"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { PageTransition } from "@/components/layout/page-transition";
import { WhiteboardCanvas } from "@/features/whiteboard/whiteboard-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  user: {
    id: string;
    fullName: string;
    bio?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  };
};

export function WhiteboardShell({ user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const storageKey = `taskflow:whiteboard:${user.id}`;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setQuickAddOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Whiteboard"
          subtitle="Sketch plans on an HTML Canvas before they become tasks."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <PageTransition className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Planning canvas</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Use the pen to map flows, priorities, or sprint notes. Export a PNG or create a
                    task when an idea is ready.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setQuickAddOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Turn into task
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/tasks">View tasks</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <WhiteboardCanvas storageKey={storageKey} />
        </PageTransition>
      </div>
      <BottomNav />
      <TaskFormDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
