/** Design tokens shared across web, extension, mobile, and desktop */
export const tokens = {
  colors: {
    primary: "#6366F1",
    purple: "#8B5CF6",
    pink: "#EC4899",
    orange: "#F59E0B",
    green: "#10B981",
    red: "#EF4444",
    blue: "#3B82F6",
    background: "#F8FAFC",
    card: "#FFFFFF",
    foreground: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    sidebarFrom: "#1E1B4B",
    sidebarVia: "#312E81",
    sidebarTo: "#4C1D95",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    section: 24,
    card: 20,
  },
  shadow: {
    card: "0 4px 24px rgba(15, 23, 42, 0.06)",
    soft: "0 2px 12px rgba(15, 23, 42, 0.04)",
  },
  gradients: {
    quickAdd: "linear-gradient(90deg, #F59E0B 0%, #EC4899 100%)",
    upgrade: "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
    sidebar: "linear-gradient(180deg, #1E1B4B 0%, #312E81 55%, #4C1D95 100%)",
  },
} as const;
