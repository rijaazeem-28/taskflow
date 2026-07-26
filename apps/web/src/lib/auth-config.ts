/** Set false only for temporary guest-only demos. Keep true for normal login/signup. */
export const AUTH_ENABLED = true;

export const GUEST_USER_ID = "guest-local";

export const GUEST_PROFILE = {
  id: GUEST_USER_ID,
  userId: GUEST_USER_ID,
  fullName: "Guest User",
  email: "guest@taskflow.local",
  avatarUrl: null as string | null,
  role: "Member",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
