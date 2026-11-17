"use client";

import { useTransition } from "react";
import {
  clearSeasonOverride,
  cycleSeasonOverride,
} from "@/app/actions/season";
import type { Season } from "@/lib/season";

const LABELS: Record<Season, string> = {
  spring: "весна",
  summer: "лето",
  autumn: "осень",
  winter: "зима",
};

type SeasonSwitcherProps = {
  season: Season;
  naturalSeason: Season;
  overridden: boolean;
};

/** Temporary test control — cycles spring → summer → autumn → winter. */
export function SeasonSwitcher({
  season,
  naturalSeason,
  overridden,
}: SeasonSwitcherProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="season-switcher" role="group" aria-label="Тест сезона">
      <button
        type="button"
        className="season-switcher-btn"
        disabled={pending}
        onClick={() => startTransition(() => cycleSeasonOverride(season))}
      >
        Сезон: {LABELS[season]}
      </button>
      {overridden ? (
        <button
          type="button"
          className="season-switcher-reset"
          disabled={pending}
          onClick={() => startTransition(() => clearSeasonOverride())}
          title={`Сброс к ${LABELS[naturalSeason]}`}
        >
          авто
        </button>
      ) : null}
    </div>
  );
}
