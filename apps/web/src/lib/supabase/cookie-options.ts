/** Strip maxAge/expires so auth cookies are browser-session only (cleared on browser close). */
export function toSessionCookieOptions(options?: Record<string, unknown>) {
  if (!options) return {};
  const next = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next;
}
