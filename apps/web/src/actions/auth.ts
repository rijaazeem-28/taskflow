"use server";

import { redirect } from "next/navigation";
import { loginSchema, signupSchema } from "@taskflow/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createProfile, getProfileByUserId } from "@/services/profile";

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

/**
 * Simple signup — create account and sign in (no email OTP / Resend).
 */
export async function signupAction(formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { fullName, email, password } = parsed.data;
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in instead.",
      };
    }
    return { success: false, error: createError.message };
  }

  if (!created.user) {
    return { success: false, error: "Unable to create account. Please try again." };
  }

  try {
    await createProfile({
      userId: created.user.id,
      fullName,
      email,
    });
  } catch (e) {
    console.error("[signup] profile create failed", e);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return {
      success: false,
      error: "Account created. Please sign in with your email and password.",
    };
  }

  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on" || formData.get("rememberMe") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("email not confirmed") || message.includes("not confirmed")) {
      return {
        success: false,
        error: "Email not confirmed. Try signing up again or contact support.",
      };
    }
    if (message.includes("invalid login") || message.includes("invalid credentials")) {
      return { success: false, error: "Invalid email or password." };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Unable to sign in." };
  }

  try {
    const existing = await getProfileByUserId(data.user.id);
    if (!existing) {
      await createProfile({
        userId: data.user.id,
        fullName:
          (data.user.user_metadata?.full_name as string | undefined) ??
          data.user.email?.split("@")[0] ??
          "TaskFlow User",
        email: data.user.email ?? email,
      });
    }
  } catch (e) {
    console.error("[login] profile ensure failed", e);
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
