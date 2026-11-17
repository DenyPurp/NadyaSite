import type { ReactNode } from "react";
import { getCurrentSeason } from "@/lib/season";

type SeasonShellProps = {
  children: ReactNode;
};

/** Request-time season wrapper — must sit under `<Suspense>`. */
export async function SeasonShell({ children }: SeasonShellProps) {
  const season = await getCurrentSeason();
  return (
    <div className="season-shell" data-season={season}>
      {children}
    </div>
  );
}

/** Static fallback while Moscow season resolves. */
export function SeasonShellFallback({ children }: SeasonShellProps) {
  return (
    <div className="season-shell" data-season="autumn">
      {children}
    </div>
  );
}
