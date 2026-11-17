import { connection } from "next/server";
import { moscowTodayKey, partsFromDayKey } from "@/lib/moscow-time";

export type Season = "spring" | "summer" | "autumn" | "winter";

/** Season from a 1-based calendar month (Europe/Moscow civil month). */
export function seasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/** Season for a concrete instant (Europe/Moscow civil month). */
export function currentSeason(now: Date): Season {
  const { month } = partsFromDayKey(moscowTodayKey(now));
  return seasonFromMonth(month);
}

/**
 * Request-time season for Server Components.
 * Awaits `connection()` so `new Date()` is not evaluated during prerender.
 */
export async function getCurrentSeason(): Promise<Season> {
  await connection();
  return currentSeason(new Date());
}
