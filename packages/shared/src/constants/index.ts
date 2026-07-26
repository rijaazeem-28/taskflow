import type { Category, NavItem, TaskPriority, TaskStatus } from "../types";

export const APP_NAME = "TaskFlow";
export const APP_TAGLINE = "Organize work. Ship faster.";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  verifyEmail: "/verify-email",
  dashboard: "/dashboard",
  tasks: "/tasks",
  calendar: "/calendar",
  board: "/board",
  projects: "/projects",
  categories: "/categories",
  team: "/team",
  analytics: "/analytics",
  activity: "/activity",
  whiteboard: "/whiteboard",
  settings: "/settings",
  profile: "/profile",
} as const;

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: "LayoutDashboard" },
  { label: "My Tasks", href: ROUTES.tasks, icon: "CheckSquare" },
  { label: "Board", href: ROUTES.board, icon: "Kanban" },
  { label: "Calendar", href: ROUTES.calendar, icon: "Calendar" },
  { label: "Categories", href: ROUTES.categories, icon: "Tags" },
  { label: "Whiteboard", href: ROUTES.whiteboard, icon: "PenTool" },
  { label: "Analytics", href: ROUTES.analytics, icon: "BarChart3" },
  { label: "Activity", href: ROUTES.activity, icon: "Activity" },
  { label: "Profile", href: ROUTES.profile, icon: "User" },
  { label: "Settings", href: ROUTES.settings, icon: "Settings" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: ROUTES.dashboard, icon: "LayoutDashboard" },
  { label: "Tasks", href: ROUTES.tasks, icon: "CheckSquare" },
  { label: "Board", href: ROUTES.board, icon: "Kanban" },
  { label: "Calendar", href: ROUTES.calendar, icon: "Calendar" },
  { label: "Settings", href: ROUTES.settings, icon: "Settings" },
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "#10B981",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#EF4444",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  COMPLETED: "#8B5CF6",
  IN_PROGRESS: "#3B82F6",
  TODO: "#64748B",
  ON_HOLD: "#EC4899",
  CANCELLED: "#F43F5E",
};

export const DEFAULT_CATEGORIES: Array<Pick<Category, "name" | "color" | "icon">> = [
  { name: "Personal", color: "#EC4899", icon: "User" },
  { name: "Work", color: "#6366F1", icon: "Briefcase" },
  { name: "Study", color: "#8B5CF6", icon: "GraduationCap" },
  { name: "Shopping", color: "#F59E0B", icon: "ShoppingBag" },
  { name: "Health", color: "#10B981", icon: "Heart" },
  { name: "Others", color: "#64748B", icon: "MoreHorizontal" },
];

export const REMINDER_OPTIONS = [
  { value: "NONE", label: "No reminder" },
  { value: "15M", label: "15 minutes before" },
  { value: "30M", label: "30 minutes before" },
  { value: "1H", label: "1 hour before" },
  { value: "1D", label: "1 day before" },
  { value: "CUSTOM", label: "Custom date & time" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "completedFirst", label: "Completed First" },
  { value: "pendingFirst", label: "Pending First" },
] as const;

export const BRAND = {
  primary: "#6366F1",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  background: "#F8FAFC",
  darkBackground: "#0F172A",
  sidebarFrom: "#1E1B4B",
  sidebarTo: "#312E81",
} as const;
