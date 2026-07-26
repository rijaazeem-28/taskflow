import { getFromEmail, getResend } from "@/lib/resend";
import {
  otpEmailTemplate,
  verifyEmailTemplate,
  welcomeEmailTemplate,
} from "@/lib/email/templates";

export async function sendVerifyEmail({
  to,
  fullName,
  verifyUrl,
}: {
  to: string;
  fullName: string;
  verifyUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in apps/web/.env");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: "Verify your TaskFlow email",
    html: verifyEmailTemplate({ fullName, verifyUrl, appUrl }),
  });

  if (error) throw new Error(error.message);
  return { skipped: false as const };
}

export async function sendOtpEmail({
  to,
  fullName,
  otp,
}: {
  to: string;
  fullName: string;
  otp: string;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("Email is not configured. Set RESEND_API_KEY in apps/web/.env");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `${otp} is your TaskFlow verification code`,
    html: otpEmailTemplate({ fullName, otp, appUrl }),
  });

  if (error) {
    console.error("[email] OTP send failed", error);
    throw new Error(error.message);
  }

  console.info("[email] OTP sent to", to, "id:", data?.id);
  return { skipped: false as const, id: data?.id };
}

export async function sendWelcomeEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipped welcome email");
    return { skipped: true as const };
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`;
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: "Welcome to TaskFlow 🎉",
    html: welcomeEmailTemplate({ fullName, dashboardUrl }),
  });

  if (error) {
    console.warn("[email] welcome failed", error.message);
    return { skipped: true as const };
  }

  return { skipped: false as const };
}
