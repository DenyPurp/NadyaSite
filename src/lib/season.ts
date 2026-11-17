import { cookies } from "next/headers";
import { connection } from "next/server";
import { moscowTodayKey, partsFromDayKey } from "@/lib/moscow-time";

export type Season = "spring" | "summer" | "autumn" | "winter";

/** Cookie for temporary season switcher (dev/test). */
export const SEASON_COOKIE = "nadyasite-season-override";

const SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"];

/** Three soft watercolor backgrounds per season under `/public/seasonal/`. */
export const SEASONAL_BG_COUNT = 3;

export function isSeason(value: string | undefined | null): value is Season {
  return Boolean(value && (SEASONS as readonly string[]).includes(value));
}

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
 * Deterministic 0-based index into the season's 3 backgrounds.
 * Stable for the whole Europe/Moscow calendar day (and season override).
 */
export function dailySeasonalBgIndex(
  dayKey: string,
  season: Season,
): number {
  let hash = 0;
  const seed = `${dayKey}:${season}`;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % SEASONAL_BG_COUNT;
}

/** Public URL for today's seasonal page background. */
export function seasonalBackgroundUrl(
  season: Season,
  dayKey: string,
): string {
  const index = dailySeasonalBgIndex(dayKey, season) + 1;
  const file = String(index).padStart(2, "0");
  return `/seasonal/${season}/${file}.jpg`;
}

/**
 * Request-time season for Server Components.
 * Awaits `connection()` so `new Date()` is not evaluated during prerender.
 * Optional cookie override powers the temporary season switcher (dev/test).
 */
export async function getCurrentSeason(): Promise<Season> {
  await connection();
  const cookieStore = await cookies();
  const override = cookieStore.get(SEASON_COOKIE)?.value;
  if (isSeason(override)) {
    return override;
  }
  return currentSeason(new Date());
}

/** Natural Moscow season without cookie override (for switcher label). */
export async function getNaturalSeason(): Promise<Season> {
  await connection();
  return currentSeason(new Date());
}
