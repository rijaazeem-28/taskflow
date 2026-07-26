"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { Category, Task, TaskStatus } from "@taskflow/shared";
import { updateTaskAction } from "@/actions/tasks";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { cn } from "@/lib/utils";

const COLUMNS: { id: TaskStatus; title: string; tint: string }[] = [
  { id: "TODO", title: "Todo", tint: "bg-slate-50" },
  { id: "IN_PROGRESS", title: "In Progress", tint: "bg-sky-50/70" },
  { id: "COMPLETED", title: "Completed", tint: "bg-emerald-50/70" },
];

function ColumnDroppable({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && "ring-2 ring-violet-300")}
    >
      {children}
    </div>
  );
}

function TaskCard({ task, dragging }: { task: Task; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "cursor-grab rounded-2xl border border-slate-100 bg-white p-3 shadow-sm active:cursor-grabbing",
        (isDragging || dragging) && "opacity-60 shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <PriorityBadge priority={task.priority} size="sm" />
        {task.category ? (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
            {task.category}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function KanbanBoard({
  user,
  tasks,
  categories,
}: {
  user: { fullName: string; role?: string | null; avatarUrl?: string | null };
  tasks: Task[];
  categories: Category[];
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
    for (const task of tasks) {
      if (map[task.status]) map[task.status].push(task);
      else if (task.status === "ON_HOLD" || task.status === "CANCELLED") map.TODO.push(task);
    }
    return map;
  }, [tasks]);

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const taskId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;

    let nextStatus: TaskStatus | null = null;
    if (COLUMNS.some((c) => c.id === overId)) {
      nextStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) nextStatus = overTask.status;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !nextStatus || task.status === nextStatus) return;

    startTransition(async () => {
      const result = await updateTaskAction({ id: taskId, status: nextStatus });
      if (!result.success) toast.error(result.error ?? "Failed to move task");
      else {
        toast.success(`Moved to ${nextStatus.replace("_", " ").toLowerCase()}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setCreateOpen(true)}
        user={user}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopHeader
          title="Board"
          subtitle="Drag tasks across Todo, In Progress, and Completed."
          userName={user.fullName}
          avatarUrl={user.avatarUrl}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-auto px-4 py-5 sm:px-6 lg:px-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="flex min-w-[860px] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.id} className={cn("rounded-2xl p-3", col.tint)}>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-slate-800">{col.title}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {grouped[col.id]?.length ?? 0}
                    </span>
                  </div>
                  <SortableContext
                    id={col.id}
                    items={(grouped[col.id] ?? []).map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ColumnDroppable
                      id={col.id}
                      className="min-h-[420px] space-y-2 rounded-2xl border border-dashed border-slate-200/80 p-2"
                    >
                      {(grouped[col.id] ?? []).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {(grouped[col.id] ?? []).length === 0 ? (
                        <p className="px-2 py-8 text-center text-xs text-slate-400">Drop tasks here</p>
                      ) : null}
                    </ColumnDroppable>
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} dragging /> : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
      <BottomNav />
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
