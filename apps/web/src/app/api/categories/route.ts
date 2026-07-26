import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCategories, createCategory } from "@/services/categories";
import { categorySchema } from "@taskflow/shared";

async function userId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await listCategories(id);
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }
  const category = await createCategory(id, parsed.data);
  return NextResponse.json({ category }, { status: 201 });
}
