import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export function getFromEmail() {
  // Resend rejects arbitrary Gmail "from" addresses unless the domain is verified.
  // Default to Resend's onboarding sender for local/dev OTP delivery.
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (!configured) return "TaskFlow <onboarding@resend.dev>";

  const lower = configured.toLowerCase();
  if (lower.includes("@gmail.com") || lower.includes("@yahoo.com") || lower.includes("@outlook.com")) {
    console.warn(
      "[email] RESEND_FROM_EMAIL looks like a personal inbox — using onboarding@resend.dev instead. Verify a domain in Resend to send from your own address."
    );
    return "TaskFlow <onboarding@resend.dev>";
  }

  if (configured.includes("<")) return configured;
  return `TaskFlow <${configured}>`;
}
