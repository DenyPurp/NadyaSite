import { Suspense } from "react";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";

async function HomeGreeting() {
  const session = await auth();
  const displayName = session?.user?.displayName ?? "друг";
  const isTeacher = session?.user?.role === Role.TEACHER;

  return (
    <section className="home-hero">
      <h1 className="greeting">Здравствуй, {displayName}</h1>
      <p className="home-support">
        {isTeacher
          ? "Кабинет учителя появится здесь позже. Пока это общий вход."
          : "Здесь появятся календарь занятий и задания."}
      </p>
    </section>
  );
}

function GreetingFallback() {
  return (
    <section className="home-hero" aria-hidden="true">
      <h1 className="greeting">Здравствуй…</h1>
      <p className="home-support">Загружаем ваш кабинет.</p>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="home-stage">
      <header className="home-bar">
        <p className="brand brand--compact">NadyaSite</p>
        <LogoutButton />
      </header>
      <Suspense fallback={<GreetingFallback />}>
        <HomeGreeting />
      </Suspense>
    </main>
  );
}
