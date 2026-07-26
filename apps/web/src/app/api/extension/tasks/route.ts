import { NextResponse } from "next/server";
import { taskSchema } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import { createTask, listTasks } from "@/services/tasks";
import { serializeTask } from "@/lib/serialize";
import { logActivity } from "@/lib/activity-store";
import { resolveExtensionToken } from "@/lib/extension-tokens";

async function resolveUserId(request: Request) {
  const auth = request.headers.get("authorization");
  const headerToken = request.headers.get("x-taskflow-token");
  const fromToken = await resolveExtensionToken(auth ?? headerToken);
  if (fromToken) return fromToken;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", loggedIn: false }, { status: 401 });
  }

  const tasks = await listTasks(userId).catch(() => []);
  const recent = tasks
    .map(serializeTask)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const pending = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length;

  return NextResponse.json({
    loggedIn: true,
    pending,
    tasks: recent,
  });
}

export async function POST(request: Request) {
  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", loggedIn: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = body as {
    title?: string;
    description?: string | null;
    priority?: string;
    sourceUrl?: string | null;
  };

  const descriptionParts = [
    input.description?.trim() || "",
    input.sourceUrl ? `Captured from: ${input.sourceUrl}` : "",
  ].filter(Boolean);

  const parsed = taskSchema.safeParse({
    title: (input.title ?? "").trim(),
    description: descriptionParts.join("\n\n") || null,
    priority: input.priority ?? "MEDIUM",
    status: "TODO",
    dueDate: null,
    category: "Extension",
    reminderOffset: "NONE",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid task" },
      { status: 400 }
    );
  }

  const task = await createTask(userId, parsed.data);
  await logActivity(userId, {
    type: "task_created",
    title: `Created “${task.title}”`,
    description: "Added via Chrome extension",
    meta: { taskId: task.id },
  }).catch(() => undefined);

  return NextResponse.json({
    success: true,
    task: serializeTask(task),
  });
}
