import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignupForm } from "@/features/auth/signup-form";
import { LogoutButton } from "@/components/layout/logout-button";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "your account";

    return (
      <Card className="border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">You&apos;re already signed in</CardTitle>
          <CardDescription>
            Signed in as <span className="font-semibold text-slate-700">{name}</span>. Log out
            first if you want to create a different account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <LogoutButton
            className="bg-rose-50 text-rose-600 hover:bg-rose-100"
            label="Logout & create new account"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Enter your details to get started with TaskFlow</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
