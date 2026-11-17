import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { SeasonalDecor } from "@/components/seasonal-decor";
import { getCurrentSeason } from "@/lib/season";

function LoginComposition() {
  return (
    <div className="login-composition">
      <p className="brand">Cozy English with Nadya</p>
      <h1 className="login-lead">Войдите, чтобы открыть занятия</h1>
      <LoginForm />
      <p className="login-hint">Аккаунт выдаёт учитель — самостоятельной регистрации нет.</p>
    </div>
  );
}

async function LoginWithDecor() {
  const season = await getCurrentSeason();
  return (
    <main className="login-stage seasonal-stage">
      <SeasonalDecor season={season} />
      <LoginComposition />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="login-stage seasonal-stage">
          <LoginComposition />
        </main>
      }
    >
      <LoginWithDecor />
    </Suspense>
  );
}
