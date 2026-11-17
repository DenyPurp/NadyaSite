import type { CSSProperties, ReactNode } from "react";
import { moscowTodayKey } from "@/lib/moscow-time";
import {
  getCurrentSeason,
  seasonalBackgroundUrl,
  type Season,
} from "@/lib/season";

type SeasonShellProps = {
  children: ReactNode;
};

function seasonShellStyle(season: Season, dayKey: string): CSSProperties {
  const bgUrl = seasonalBackgroundUrl(season, dayKey);
  return {
    "--season-bg": `url(${bgUrl})`,
  } as CSSProperties;
}

/** Request-time season wrapper — must sit under `<Suspense>`. */
export async function SeasonShell({ children }: SeasonShellProps) {
  const season = await getCurrentSeason();
  const dayKey = moscowTodayKey();
  return (
    <div
      className="season-shell"
      data-season={season}
      data-season-bg={seasonalBackgroundUrl(season, dayKey)}
      style={seasonShellStyle(season, dayKey)}
    >
      {children}
    </div>
  );
}

/** Static fallback while Moscow season resolves (no photo until day+season resolve). */
export function SeasonShellFallback({ children }: SeasonShellProps) {
  return (
    <div className="season-shell" data-season="autumn">
      {children}
    </div>
  );
}
