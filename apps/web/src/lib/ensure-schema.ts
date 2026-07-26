import { readFile } from "fs/promises";
import path from "path";

let attempted = false;

/** Best-effort: create profiles/tasks tables via pooler when available. */
export async function ensureSchema() {
  if (attempted) return;
  attempted = true;

  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) return;

  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 8 });
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    const schema = await readFile(schemaPath, "utf8");
    await sql.unsafe(schema);
    await sql.end({ timeout: 5 });
    console.log("[ensure-schema] tables ready");
  } catch (e) {
    console.warn(
      "[ensure-schema] skipped — run apps/web/supabase/schema.sql in Supabase SQL Editor",
      e instanceof Error ? e.message : e
    );
  }
}
