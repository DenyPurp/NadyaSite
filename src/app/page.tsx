import { Suspense } from "react";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { StudentCalendar } from "@/components/student-calendar";
import { getStudentLessons } from "@/lib/lessons";
import { moscowTodayKey } from "@/lib/moscow-time";

async function StudentHome() {
  const session = await auth();
  const displayName = session?.user?.displayName ?? "друг";
  const isTeacher = session?.user?.role === Role.TEACHER;
  const todayKey = moscowTodayKey();

  if (isTeacher || !session?.user?.id) {
    return (
      <section className="home-hero">
        <p className="brand">Cozy English with Nadya</p>
        <h1 className="greeting">Здравствуй, {displayName}</h1>
        <p className="home-support">
          Кабинет учителя появится здесь позже. Пока это общий вход.
        </p>
      </section>
    );
  }

  const lessons = await getStudentLessons(session.user.id);

  return (
    <>
      <section className="home-hero home-hero--student">
        <p className="brand">Cozy English with Nadya</p>
        <h1 className="greeting">Здравствуй, {displayName}</h1>
        <p className="home-support">
          Здесь ваш календарь занятий — темы и короткие конспекты прошлых уроков.
        </p>
      </section>
      <StudentCalendar lessons={lessons} todayKey={todayKey} />
    </>
  );
}

function HomeFallback() {
  return (
    <section className="home-hero" aria-hidden="true">
      <p className="brand">Cozy English with Nadya</p>
      <h1 className="greeting">Здравствуй…</h1>
      <p className="home-support">Загружаем ваш кабинет.</p>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="home-stage">
      <header className="home-bar">
        <LogoutButton />
      </header>
      <Suspense fallback={<HomeFallback />}>
        <StudentHome />
      </Suspense>
    </main>
  );
}
