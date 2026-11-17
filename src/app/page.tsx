import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { AssignmentReserve } from "@/components/assignment-reserve";
import { GoalsList } from "@/components/goals-list";
import { HomeworkList } from "@/components/homework-list";
import { LogoutButton } from "@/components/logout-button";
import { SeasonSwitcher } from "@/components/season-switcher";
import { StudentCalendar } from "@/components/student-calendar";
import { WishWordRoll } from "@/components/wish-word-roll";
import { getStudentGoals, getStudentHomework } from "@/lib/dashboard";
import { getStudentLessons } from "@/lib/lessons";
import { moscowTodayKey } from "@/lib/moscow-time";
import {
  getCurrentSeason,
  getNaturalSeason,
  SEASON_COOKIE,
  isSeason,
} from "@/lib/season";

async function StudentHome() {
  const session = await auth();
  const displayName = session?.user?.displayName ?? "друг";
  const isTeacher = session?.user?.role === Role.TEACHER;

  if (isTeacher) {
    redirect("/admin");
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  const todayKey = moscowTodayKey();
  const [lessons, homework, goals] = await Promise.all([
    getStudentLessons(session.user.id),
    getStudentHomework(session.user.id),
    getStudentGoals(session.user.id),
  ]);

  return (
    <div className="dash">
      <header className="dash-greeting-block">
        <h1 className="greeting dash-greeting">Здравствуй, {displayName}</h1>
      </header>

      <div className="dash-top">
        <div className="dash-top-cal">
          <StudentCalendar lessons={lessons} todayKey={todayKey} compact />
        </div>
        <HomeworkList items={homework} />
      </div>

      <p className="dash-wish">
        Have a <WishWordRoll /> day!
      </p>

      <div className="dash-bottom">
        <GoalsList goals={goals} />
        <AssignmentReserve />
      </div>
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="dash" aria-hidden="true">
      <header className="dash-greeting-block">
        <h1 className="greeting dash-greeting">Здравствуй…</h1>
      </header>
      <p className="dash-wish">Загружаем ваш кабинет.</p>
    </div>
  );
}

async function HomeControls() {
  const [season, naturalSeason] = await Promise.all([
    getCurrentSeason(),
    getNaturalSeason(),
  ]);
  const cookieStore = await cookies();
  const overridden = isSeason(cookieStore.get(SEASON_COOKIE)?.value);

  return (
    <header className="home-bar home-bar--dash">
      <SeasonSwitcher
        season={season}
        naturalSeason={naturalSeason}
        overridden={overridden}
      />
      <LogoutButton />
    </header>
  );
}

export default function HomePage() {
  return (
    <main className="home-stage home-stage--dash">
      <Suspense
        fallback={
          <header className="home-bar home-bar--dash">
            <LogoutButton />
          </header>
        }
      >
        <HomeControls />
      </Suspense>
      <Suspense fallback={<HomeFallback />}>
        <StudentHome />
      </Suspense>
    </main>
  );
}
