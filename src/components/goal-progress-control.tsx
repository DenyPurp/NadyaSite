"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateGoalProgressAction,
  type AdminActionState,
} from "@/app/actions/admin";

type GoalProgressControlProps = {
  goalId: string;
  initialProgress: number;
};

const initial: AdminActionState = {};

export function GoalProgressControl({
  goalId,
  initialProgress,
}: GoalProgressControlProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [state, formAction, pending] = useActionState(
    updateGoalProgressAction,
    initial,
  );

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  return (
    <form action={formAction} className="goal-progress-control">
      <input type="hidden" name="id" value={goalId} />
      <input type="hidden" name="progress" value={progress} />
      <div className="goal-head">
        <span className="goal-pct">{progress}%</span>
      </div>
      <div
        className="goal-bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Прогресс цели"
      >
        <span className="goal-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="goal-slider-row">
        <input
          className="goal-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          aria-label="Установить прогресс"
          disabled={pending}
        />
        <button type="submit" className="admin-submit" disabled={pending}>
          {pending ? "…" : "Сохранить"}
        </button>
      </div>
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
    </form>
  );
}
