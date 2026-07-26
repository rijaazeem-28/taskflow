import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

type Store = {
  tokens: Record<string, { userId: string; label: string; createdAt: string }>;
};

const storePath = path.join(process.cwd(), ".data", "extension-tokens.json");

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return { tokens: {} };
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function createExtensionToken(userId: string, label = "Chrome") {
  const store = await readStore();
  // revoke previous tokens for this user (one active token)
  for (const [token, meta] of Object.entries(store.tokens)) {
    if (meta.userId === userId) delete store.tokens[token];
  }
  const token = `tf_${randomBytes(24).toString("hex")}`;
  store.tokens[token] = {
    userId,
    label,
    createdAt: new Date().toISOString(),
  };
  await writeStore(store);
  return token;
}

export async function resolveExtensionToken(token: string | null | undefined) {
  if (!token) return null;
  const cleaned = token.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned) return null;
  const store = await readStore();
  return store.tokens[cleaned]?.userId ?? null;
}

export async function revokeExtensionTokens(userId: string) {
  const store = await readStore();
  for (const [token, meta] of Object.entries(store.tokens)) {
    if (meta.userId === userId) delete store.tokens[token];
  }
  await writeStore(store);
}
