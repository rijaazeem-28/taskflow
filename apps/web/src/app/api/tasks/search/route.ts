import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listTasks } from "@/services/tasks";
import { serializeTask } from "@/lib/serialize";
import { filterTasks, sortTasks } from "@taskflow/shared";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as "newest") || "newest";

  const tasks = await listTasks(user.id);
  const filtered = sortTasks(
    filterTasks(
      tasks.map(serializeTask),
      { query: q }
    ),
    sort
  );
  return NextResponse.json({ tasks: filtered });
}
