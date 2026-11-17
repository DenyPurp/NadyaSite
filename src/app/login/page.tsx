import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="login-stage">
      <div className="login-composition">
        <p className="brand">NadyaSite</p>
        <h1 className="login-lead">Войдите, чтобы открыть занятия</h1>
        <LoginForm />
        <p className="login-hint">Аккаунт выдаёт учитель — самостоятельной регистрации нет.</p>
      </div>
    </main>
  );
}
