"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminActionState } from "@/app/actions/admin";

type AdminFormProps = {
  action: (
    prev: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  children?: ReactNode;
  className?: string;
  submitLabel: string;
  danger?: boolean;
  confirmMessage?: string;
};

const initial: AdminActionState = {};

export function AdminForm({
  action,
  children,
  className,
  submitLabel,
  danger = false,
  confirmMessage,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form
      action={formAction}
      className={className ?? "admin-form"}
      onSubmit={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
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
      <button
        type="submit"
        className={danger ? "admin-submit admin-submit--danger" : "admin-submit"}
        disabled={pending}
      >
        {pending ? "Сохраняем…" : submitLabel}
      </button>
    </form>
  );
}
