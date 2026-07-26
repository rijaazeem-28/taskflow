import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_CATEGORIES,
  type Category,
  type CategoryInput,
  type ReminderOffset,
  type TaskInput,
  type UpdateCategoryInput,
  type UpdateTaskInput,
  type UserProfile,
  type UserSettings,
} from "@taskflow/shared";
import { canUseLocalStore } from "@/lib/runtime";
import type { DbTask } from "@/services/tasks";

type Store = {
  profiles: UserProfile[];
  tasks: DbTask[];
  categories: Category[];
  settings: UserSettings[];
};

const storePath = path.join(process.cwd(), ".data", "taskflow-store.json");

async function readStore(): Promise<Store> {
  if (!canUseLocalStore()) {
    return { profiles: [], tasks: [], categories: [], settings: [] };
  }
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      profiles: parsed.profiles ?? [],
      tasks: parsed.tasks ?? [],
      categories: parsed.categories ?? [],
      settings: parsed.settings ?? [],
    };
  } catch {
    return { profiles: [], tasks: [], categories: [], settings: [] };
  }
}

async function writeStore(store: Store) {
  if (!canUseLocalStore()) {
    throw new Error("Local data store is unavailable in this environment. Configure Supabase.");
  }
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function reviveTask(task: DbTask): DbTask {
  return {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    reminderAt: task.reminderAt ? new Date(task.reminderAt) : null,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
}

export async function localGetProfile(userId: string) {
  const store = await readStore();
  return store.profiles.find((p) => p.userId === userId) ?? null;
}

export async function localUpsertProfile(data: Partial<UserProfile> & { userId: string; fullName: string; email: string }) {
  const store = await readStore();
  const now = new Date().toISOString();
  const existing = store.profiles.find((p) => p.userId === data.userId);
  if (existing) {
    Object.assign(existing, {
      fullName: data.fullName ?? existing.fullName,
      email: data.email ?? existing.email,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl,
      bio: data.bio !== undefined ? data.bio : existing.bio,
      timezone: data.timezone !== undefined ? data.timezone : existing.timezone,
      role: data.role ?? existing.role,
      updatedAt: now,
    });
    await writeStore(store);
    return existing;
  }
  const profile: UserProfile = {
    id: randomUUID(),
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    avatarUrl: data.avatarUrl ?? null,
    role: data.role ?? "Product Designer",
    bio: data.bio ?? "",
    timezone: data.timezone ?? "UTC",
    createdAt: now,
    updatedAt: now,
  };
  store.profiles.push(profile);
  await writeStore(store);
  return profile;
}

export async function localEnsureCategories(userId: string) {
  const store = await readStore();
  const existing = store.categories.filter((c) => c.userId === userId);
  if (existing.length > 0) return existing;
  const now = new Date().toISOString();
  const created = DEFAULT_CATEGORIES.map((c) => ({
    id: randomUUID(),
    userId,
    name: c.name,
    color: c.color,
    icon: c.icon,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }));
  store.categories.push(...created);
  await writeStore(store);
  return created;
}

export async function localListCategories(userId: string) {
  await localEnsureCategories(userId);
  const store = await readStore();
  return store.categories.filter((c) => c.userId === userId);
}

export async function localCreateCategory(userId: string, data: CategoryInput) {
  const store = await readStore();
  const now = new Date().toISOString();
  const category: Category = {
    id: randomUUID(),
    userId,
    name: data.name,
    color: data.color,
    icon: data.icon,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
  store.categories.push(category);
  await writeStore(store);
  return category;
}

export async function localUpdateCategory(userId: string, data: UpdateCategoryInput) {
  const store = await readStore();
  const cat = store.categories.find((c) => c.id === data.id && c.userId === userId);
  if (!cat) return null;
  if (data.name !== undefined) cat.name = data.name;
  if (data.color !== undefined) cat.color = data.color;
  if (data.icon !== undefined) cat.icon = data.icon;
  cat.updatedAt = new Date().toISOString();
  await writeStore(store);
  return cat;
}

export async function localDeleteCategory(id: string, userId: string) {
  const store = await readStore();
  const index = store.categories.findIndex((c) => c.id === id && c.userId === userId);
  if (index < 0) return null;
  const [removed] = store.categories.splice(index, 1);
  store.tasks.forEach((t) => {
    if (t.categoryId === id) {
      t.categoryId = null;
      t.category = null;
    }
  });
  await writeStore(store);
  return removed;
}

export async function localListTasks(userId: string) {
  const store = await readStore();
  return store.tasks
    .filter((t) => t.userId === userId)
    .map(reviveTask)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function localCreateTask(userId: string, data: TaskInput): Promise<DbTask> {
  const store = await readStore();
  const now = new Date();
  const task: DbTask = {
    id: randomUUID(),
    title: data.title,
    description: data.description ?? null,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    category: data.category ?? null,
    categoryId: data.categoryId ?? null,
    reminderOffset: (data.reminderOffset as ReminderOffset | null) ?? "NONE",
    reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  store.tasks.unshift(task);
  await writeStore(store);
  return task;
}

export async function localUpdateTask(userId: string, data: UpdateTaskInput): Promise<DbTask | null> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === data.id && t.userId === userId);
  if (!task) return null;

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description ?? null;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.category !== undefined) task.category = data.category ?? null;
  if (data.categoryId !== undefined) task.categoryId = data.categoryId ?? null;
  if (data.reminderOffset !== undefined) task.reminderOffset = data.reminderOffset ?? "NONE";
  if (data.reminderAt !== undefined) task.reminderAt = data.reminderAt ? new Date(data.reminderAt) : null;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  task.updatedAt = new Date();
  await writeStore(store);
  return reviveTask(task);
}

export async function localDeleteTask(id: string, userId: string): Promise<DbTask | null> {
  const store = await readStore();
  const index = store.tasks.findIndex((t) => t.id === id && t.userId === userId);
  if (index < 0) return null;
  const [removed] = store.tasks.splice(index, 1);
  await writeStore(store);
  return reviveTask(removed);
}

export async function localGetTask(id: string, userId: string) {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id && t.userId === userId);
  return task ? reviveTask(task) : null;
}

export async function localGetSettings(userId: string): Promise<UserSettings> {
  const store = await readStore();
  const existing = store.settings.find((s) => s.userId === userId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const settings: UserSettings = {
    id: randomUUID(),
    userId,
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    createdAt: now,
    updatedAt: now,
  };
  store.settings.push(settings);
  await writeStore(store);
  return settings;
}

export async function localUpdateSettings(userId: string, data: Partial<UserSettings>) {
  const current = await localGetSettings(userId);
  const store = await readStore();
  const settings = store.settings.find((s) => s.userId === userId)!;
  Object.assign(settings, data, { updatedAt: new Date().toISOString() });
  await writeStore(store);
  return settings ?? current;
}
