import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card className="border-slate-100 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <MailCheck className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl">Confirm your email</CardTitle>
        <CardDescription>
          We sent a confirmation link{email ? ` to ${email}` : ""}. Confirm your email, then sign
          in — you won&apos;t be logged in automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Important</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-4">
            <li>
              Open the confirmation link on <span className="font-medium">this computer</span>{" "}
              (where TaskFlow is running at localhost:3000).
            </li>
            <li>
              If you open it on your phone and see “localhost refused to connect”, your email is
              usually still confirmed — come back here and sign in.
            </li>
            <li>Each account has its own tasks and profile data.</li>
          </ul>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">Go to Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/signup">Use a different email</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
