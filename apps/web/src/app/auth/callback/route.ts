import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after email confirmation.
 * We exchange the code (confirms the account), then send the user to login
 * so they sign in themselves — not auto-dumped on the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/login?confirmed=1";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Confirmation failed. Try signing in or request a new link.")}`
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email",
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Confirmation failed. Try signing in or request a new link.")}`
      );
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_confirmation_code`);
  }

  // Force a clean login after confirmation (each user signs in to their own account)
  await supabase.auth.signOut();

  const redirectTo = next.startsWith("/") ? next : "/login?confirmed=1";
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
