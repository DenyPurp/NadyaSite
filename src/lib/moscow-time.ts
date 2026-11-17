/** Calendar timezone for NadyaSite (plan §1.3 / risks). */
export const CALENDAR_TZ = "Europe/Moscow";

const mskDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CALENDAR_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's calendar date in Europe/Moscow as `YYYY-MM-DD`. */
export function moscowTodayKey(now: Date = new Date()): string {
  return mskDateFormatter.format(now);
}

/** Year/month parts for a Moscow calendar day key. */
export function partsFromDayKey(dayKey: string): { year: number; month: number; day: number } {
  const [y, m, d] = dayKey.split("-").map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Prisma `@db.Date` values arrive as UTC midnight for that calendar day.
 * Normalize to `YYYY-MM-DD` without shifting the civil date.
 */
export function lessonDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** UTC Date at midnight for a civil `YYYY-MM-DD` (safe for Prisma Date columns). */
export function utcDateFromDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00.000Z`);
}

/** Shift a Moscow day key by N days. */
export function shiftDayKey(dayKey: string, deltaDays: number): string {
  const { year, month, day } = partsFromDayKey(dayKey);
  const utc = Date.UTC(year, month - 1, day + deltaDays);
  const d = new Date(utc);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** First day key of a month (1-based month). */
export function monthStartKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/** Last day key of a month (1-based month). */
export function monthEndKey(year: number, month: number): string {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

const monthTitleFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

export function formatMonthTitle(year: number, month: number): string {
  const label = monthTitleFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatLongDay(dayKey: string): string {
  const { year, month, day } = partsFromDayKey(dayKey);
  const label = longDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
