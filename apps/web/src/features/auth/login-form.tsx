"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@taskflow/shared";
import { loginAction } from "@/actions/auth";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "1";
  const urlError = searchParams.get("error");

  const [error, setError] = useState<string | null>(urlError);
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    const fd = new FormData();
    fd.set("email", values.email);
    fd.set("password", values.password);
    if (values.rememberMe) fd.set("rememberMe", "true");

    startTransition(async () => {
      const result = await loginAction(fd);
      if (result && !result.success) {
        setError(result.error ?? "Login failed");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {confirmed ? (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Email confirmed. Sign in with your email and password to open your dashboard.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@company.com" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <span className="text-xs text-slate-400">Forgot Password?</span>
        </div>
        <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-xs text-rose-500">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          {...form.register("rememberMe")}
        />
        Remember me
      </label>

      {error ? (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
          Create account
        </Link>
      </p>
    </form>
  );
}
