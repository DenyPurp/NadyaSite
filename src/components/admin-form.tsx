"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminActionState } from "@/app/actions/admin";

type AdminFormProps = {
  action: (
    prev: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  children: ReactNode;
  className?: string;
  submitLabel: string;
};

const initial: AdminActionState = {};

export function AdminForm({
  action,
  children,
  className,
  submitLabel,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className={className ?? "admin-form"}>
      {children}
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="admin-ok" role="status">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="admin-submit" disabled={pending}>
        {pending ? "Сохраняем…" : submitLabel}
      </button>
    </form>
  );
}
