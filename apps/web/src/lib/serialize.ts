import type { Task, UserProfile } from "@taskflow/shared";
import type { DbProfile } from "@/services/profile";
import type { DbTask } from "@/services/tasks";

export function serializeTask(task: DbTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    category: task.category,
    categoryId: task.categoryId,
    reminderOffset: task.reminderOffset ?? "NONE",
    reminderAt: task.reminderAt ? task.reminderAt.toISOString() : null,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function serializeProfile(profile: DbProfile): UserProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    bio: profile.bio ?? null,
    timezone: profile.timezone ?? "UTC",
    createdAt:
      typeof profile.createdAt === "string"
        ? profile.createdAt
        : new Date(profile.createdAt).toISOString(),
    updatedAt:
      typeof profile.updatedAt === "string"
        ? profile.updatedAt
        : new Date(profile.updatedAt).toISOString(),
  };
}
