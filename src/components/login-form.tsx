"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="login-form" noValidate>
      <div className="field">
        <label htmlFor="login">Логин</label>
        <input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          required
          autoFocus
          disabled={pending}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="login-submit" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
