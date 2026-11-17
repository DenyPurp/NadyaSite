import { Suspense } from "react";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { SeasonalDecor } from "@/components/seasonal-decor";
import { StudentCalendar } from "@/components/student-calendar";
import { getStudentLessons } from "@/lib/lessons";
import { moscowTodayKey } from "@/lib/moscow-time";
import { getCurrentSeason } from "@/lib/season";

async function StudentHome() {
  const session = await auth();
  const displayName = session?.user?.displayName ?? "друг";
  const isTeacher = session?.user?.role === Role.TEACHER;
  const todayKey = moscowTodayKey();

  if (isTeacher || !session?.user?.id) {
    return (
      <div className="home-center">
        <section className="home-hero">
          <p className="brand">Cozy English with Nadya</p>
          <h1 className="greeting">Здравствуй, {displayName}</h1>
          <p className="home-support">
            Кабинет учителя появится здесь позже. Пока это общий вход.
          </p>
        </section>
      </div>
    );
  }

  const lessons = await getStudentLessons(session.user.id);

  return (
    <div className="home-center">
      <section className="home-hero home-hero--student">
        <p className="brand">Cozy English with Nadya</p>
        <h1 className="greeting">Здравствуй, {displayName}</h1>
        <p className="home-support">
          Здесь ваш календарь занятий — темы и короткие конспекты прошлых уроков.
        </p>
      </section>
      <StudentCalendar lessons={lessons} todayKey={todayKey} />
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="home-center">
      <section className="home-hero" aria-hidden="true">
        <p className="brand">Cozy English with Nadya</p>
        <h1 className="greeting">Здравствуй…</h1>
        <p className="home-support">Загружаем ваш кабинет.</p>
      </section>
    </div>
  );
}

async function HomeDecor() {
  const season = await getCurrentSeason();
  return <SeasonalDecor season={season} />;
}

export default function HomePage() {
  return (
    <main className="home-stage seasonal-stage">
      <Suspense fallback={null}>
        <HomeDecor />
      </Suspense>
      <header className="home-bar">
        <LogoutButton />
      </header>
      <Suspense fallback={<HomeFallback />}>
        <StudentHome />
      </Suspense>
    </main>
  );
}
