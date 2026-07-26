import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createExtensionToken, revokeExtensionTokens } from "@/lib/extension-tokens";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await createExtensionToken(user.id);
  return NextResponse.json({
    token,
    message: "Paste this token into the TaskFlow Chrome extension options.",
  });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await revokeExtensionTokens(user.id);
  return NextResponse.json({ success: true });
}
