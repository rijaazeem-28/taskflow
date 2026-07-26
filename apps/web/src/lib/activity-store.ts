import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { ActivityEvent } from "@/lib/activity-types";
import { canUseLocalStore } from "@/lib/runtime";

export type { ActivityEvent, ActivityType } from "@/lib/activity-types";
export { groupActivity } from "@/lib/activity-types";

type Store = { events: ActivityEvent[] };

const storePath = path.join(process.cwd(), ".data", "activity-store.json");
const memoryEvents: ActivityEvent[] = [];

async function readStore(): Promise<Store> {
  if (!canUseLocalStore()) {
    return { events: memoryEvents.filter(Boolean) };
  }
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return { events: [] };
  }
}

async function writeStore(store: Store) {
  if (!canUseLocalStore()) {
    memoryEvents.length = 0;
    memoryEvents.push(...store.events.slice(0, 500));
    return;
  }
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function logActivity(
  userId: string,
  input: Omit<ActivityEvent, "id" | "userId" | "createdAt">
) {
  const store = await readStore();
  const event: ActivityEvent = {
    id: randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    ...input,
  };
  store.events.unshift(event);
  store.events = store.events.slice(0, 500);
  await writeStore(store);
  return event;
}

export async function listActivity(userId: string) {
  const store = await readStore();
  return store.events.filter((e) => e.userId === userId);
}
