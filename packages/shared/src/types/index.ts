export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
export type ReminderOffset = "NONE" | "15M" | "30M" | "1H" | "1D" | "CUSTOM";
export type ThemePreference = "light" | "dark" | "system";
export type SortOption =
  | "newest"
  | "oldest"
  | "dueDate"
  | "priority"
  | "alphabetical"
  | "completedFirst"
  | "pendingFirst";

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
  bio?: string | null;
  timezone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  category?: string | null;
  categoryId?: string | null;
  reminderOffset?: ReminderOffset | null;
  reminderAt?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemePreference;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  onHold: number;
  cancelled: number;
  overdue: number;
  today: number;
  upcoming: number;
  completionRate: number;
  completedChange: number;
  inProgressChange: number;
  pendingChange: number;
  totalChange: number;
}

export interface TaskFilters {
  query?: string;
  statuses?: TaskStatus[];
  priorities?: TaskPriority[];
  categoryIds?: string[];
  dueToday?: boolean;
  upcoming?: boolean;
  completed?: boolean;
  overdue?: boolean;
  pending?: boolean;
}

export interface ActivityItem {
  id: string;
  type: "completed" | "updated" | "created" | "joined";
  title: string;
  description: string;
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export type Platform = "web" | "extension" | "mobile" | "desktop";
