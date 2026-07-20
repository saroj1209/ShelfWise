/**
 * libraryHelpers.js — shared constants and pure helper functions used by
 * Libraryapp.jsx, UserDashboard.jsx, and AdminDashboard.jsx.
 */

export const TODAY = new Date("2026-07-19");

export const GENRES = ["All", "Fiction", "Non-Fiction", "Sci-Fi", "Mystery", "Biography", "Fantasy"];

/* How long a borrow request holds a copy before it auto-releases. */
export const HOLD_DURATION_MS = 24 * 60 * 60 * 1000;

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function recordStatus(rec) {
  if (rec.returned) return "returned";
  const due = new Date(rec.due);
  return due < TODAY ? "overdue" : "active";
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function msLeft(requestedAt, now) {
  return Math.max(0, requestedAt + HOLD_DURATION_MS - now);
}

export function fmtCountdown(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0 && m <= 0) return "expiring";
  if (h <= 0) return `${m}m left`;
  return `${h}h ${m}m left`;
}

export function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}