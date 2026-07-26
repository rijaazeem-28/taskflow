import { createHash, randomInt } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type PendingSignup = {
  email: string;
  fullName: string;
  password: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
};

type Store = { pending: Record<string, PendingSignup> };

const storePath = path.join(process.cwd(), ".data", "otp-signups.json");
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(email: string, otp: string) {
  return createHash("sha256").update(`${normalizeEmail(email)}:${otp}`).digest("hex");
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return { pending: {} };
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function prune(store: Store) {
  const now = Date.now();
  for (const [key, row] of Object.entries(store.pending)) {
    if (row.expiresAt < now) delete store.pending[key];
  }
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export async function savePendingSignup(input: {
  email: string;
  fullName: string;
  password: string;
  otp: string;
}) {
  const store = await readStore();
  prune(store);
  const email = normalizeEmail(input.email);
  store.pending[email] = {
    email,
    fullName: input.fullName.trim(),
    password: input.password,
    otpHash: hashOtp(email, input.otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    createdAt: Date.now(),
  };
  await writeStore(store);
}

export async function getPendingSignup(email: string) {
  const store = await readStore();
  prune(store);
  await writeStore(store);
  return store.pending[normalizeEmail(email)] ?? null;
}

export async function verifyPendingOtp(email: string, otp: string) {
  const store = await readStore();
  prune(store);
  const key = normalizeEmail(email);
  const pending = store.pending[key];
  if (!pending) {
    await writeStore(store);
    return { ok: false as const, error: "No pending signup found. Please start again." };
  }
  if (pending.expiresAt < Date.now()) {
    delete store.pending[key];
    await writeStore(store);
    return { ok: false as const, error: "OTP expired. Request a new code." };
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    delete store.pending[key];
    await writeStore(store);
    return { ok: false as const, error: "Too many attempts. Please sign up again." };
  }

  pending.attempts += 1;
  if (pending.otpHash !== hashOtp(key, otp.trim())) {
    await writeStore(store);
    return { ok: false as const, error: "Invalid OTP. Please try again." };
  }

  delete store.pending[key];
  await writeStore(store);
  return { ok: true as const, pending };
}

export async function refreshPendingOtp(email: string, otp: string) {
  const store = await readStore();
  prune(store);
  const key = normalizeEmail(email);
  const pending = store.pending[key];
  if (!pending) {
    await writeStore(store);
    return { ok: false as const, error: "No pending signup found. Please start again." };
  }
  pending.otpHash = hashOtp(key, otp);
  pending.expiresAt = Date.now() + OTP_TTL_MS;
  pending.attempts = 0;
  await writeStore(store);
  return { ok: true as const, pending };
}
