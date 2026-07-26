import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listTasks } from "@/services/tasks";
import { serializeTask } from "@/lib/serialize";

/** Upcoming reminders for the signed-in user (architecture for future email jobs). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = (await listTasks(user.id)).map(serializeTask);
  const upcoming = tasks
    .filter(
      (t) =>
        t.reminderAt &&
        t.reminderOffset &&
        t.reminderOffset !== "NONE" &&
        new Date(t.reminderAt).getTime() >= Date.now() - 60_000
    )
    .sort((a, b) => +new Date(a.reminderAt!) - +new Date(b.reminderAt!))
    .slice(0, 20);

  return NextResponse.json({ reminders: upcoming });
}
