"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SEASON_COOKIE, type Season } from "@/lib/season";

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

export async function cycleSeasonOverride(current: Season): Promise<void> {
  const index = SEASONS.indexOf(current);
  const next = SEASONS[(index + 1) % SEASONS.length];
  const cookieStore = await cookies();
  cookieStore.set(SEASON_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/", "layout");
}

export async function clearSeasonOverride(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SEASON_COOKIE);
  revalidatePath("/", "layout");
}
