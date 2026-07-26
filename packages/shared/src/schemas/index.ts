import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const signupOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(40),
  color: z.string().min(4).max(20),
  icon: z.string().min(1).max(40),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  dueDate: z.string().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  reminderOffset: z.enum(["NONE", "15M", "30M", "1H", "1D", "CUSTOM"]).optional().nullable(),
  reminderAt: z.string().optional().nullable(),
});

export const updateTaskSchema = taskSchema.partial().extend({
  id: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(80),
  bio: z.string().max(500).optional().nullable(),
  timezone: z.string().max(80).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupOtpInput = z.infer<typeof signupOtpSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
