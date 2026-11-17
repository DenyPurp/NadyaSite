"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  updateGoalProgressAction,
  type AdminActionState,
} from "@/app/actions/admin";

type GoalProgressControlProps = {
  goalId: string;
  initialProgress: number;
  /** Optional trailing control (e.g. delete) aligned with the slider row */
  trailing?: ReactNode;
};

export function GoalProgressControl({
  goalId,
  initialProgress,
  trailing,
}: GoalProgressControlProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<AdminActionState>({});

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  function save() {
    setFeedback({});
    const formData = new FormData();
    formData.set("id", goalId);
    formData.set("progress", String(progress));
    startTransition(async () => {
      try {
        const result = await updateGoalProgressAction({}, formData);
        setFeedback(result);
        if (result.ok && typeof result.message === "string") {
          // keep local progress; server revalidate refreshes list meta
        }
      } catch {
        setFeedback({ error: "Не удалось сохранить прогресс." });
      }
    });
  }

  return (
    <div className="goal-progress-control">
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
        <button
          type="button"
          className="admin-submit"
          disabled={pending}
          onClick={save}
        >
          {pending ? "…" : "Сохранить"}
        </button>
        {trailing}
      </div>
      {feedback.error ? (
        <p className="form-error" role="alert">
          {feedback.error}
        </p>
      ) : null}
      {feedback.message ? (
        <p className="admin-ok" role="status">
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
