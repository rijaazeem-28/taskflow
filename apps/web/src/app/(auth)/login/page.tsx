import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Card className="border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-center text-sm text-slate-400">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
