"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { signupSchema, type SignupInput } from "@taskflow/shared";
import { signupAction } from "@/actions/auth";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    const fd = new FormData();
    fd.set("fullName", values.fullName);
    fd.set("email", values.email);
    fd.set("password", values.password);
    fd.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await signupAction(fd);
      if (result && !result.success) {
        setError(result.error ?? "Signup failed");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Controller
          name="fullName"
          control={form.control}
          render={({ field }) => (
            <Input id="fullName" placeholder="Rija Azeem" {...field} value={field.value ?? ""} />
          )}
        />
        {form.formState.errors.fullName ? (
          <p className="text-xs text-rose-500">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Controller
          name="password"
          control={form.control}
          render={({ field }) => (
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-rose-500">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-xs text-rose-500">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      ) : null}

      <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
