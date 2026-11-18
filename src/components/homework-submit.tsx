"use client";

import { useEffect, useState, useTransition } from "react";
import {
  attachHomeworkFileAction,
  removeHomeworkFileAction,
  type HomeworkActionState,
} from "@/app/actions/homework";
import { FileDropzone } from "@/components/file-dropzone";
import type { HomeworkSubmissionDTO } from "@/lib/dashboard";

type HomeworkSubmitProps = {
  homeworkId: string;
  initialSubmissions: HomeworkSubmissionDTO[];
};

export function HomeworkSubmit({
  homeworkId,
  initialSubmissions,
}: HomeworkSubmitProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<HomeworkActionState>({});

  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  function onUploaded(info: { url: string; fileName: string }) {
    setFeedback({});
    const formData = new FormData();
    formData.set("homeworkId", homeworkId);
    formData.set("fileUrl", info.url);
    formData.set("fileName", info.fileName);
    startTransition(async () => {
      try {
        const result = await attachHomeworkFileAction({}, formData);
        setFeedback(result);
        if (
          result.ok &&
          result.submissionId &&
          result.fileUrl &&
          result.fileName &&
          result.submittedAt
        ) {
          setSubmissions((prev) => {
            if (prev.some((s) => s.id === result.submissionId)) return prev;
            return [
              ...prev,
              {
                id: result.submissionId!,
                fileUrl: result.fileUrl!,
                fileName: result.fileName!,
                submittedAt: result.submittedAt!,
              },
            ];
          });
        }
      } catch {
        setFeedback({ error: "Не удалось сохранить вложение." });
      }
    });
  }

  function removeSubmission(submissionId: string) {
    setFeedback({});
    const formData = new FormData();
    formData.set("submissionId", submissionId);
    startTransition(async () => {
      try {
        const result = await removeHomeworkFileAction({}, formData);
        setFeedback(result);
        if (result.ok) {
          setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
        }
      } catch {
        setFeedback({ error: "Не удалось удалить вложение." });
      }
    });
  }

  const atLimit = submissions.length >= 12;

  return (
    <div className="homework-submit">
      {submissions.length > 0 ? (
        <ul className="homework-files" aria-label="Прикреплённые файлы">
          {submissions.map((file) => (
            <li key={file.id} className="homework-file">
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="homework-file-link"
              >
                {file.fileName}
              </a>
              <button
                type="button"
                className="homework-file-remove"
                disabled={pending}
                onClick={() => removeSubmission(file.id)}
              >
                Убрать
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="homework-submit-hint">
          Прикрепите фото работы или файл ответа.
        </p>
      )}

      <FileDropzone
        name={`hw-submit-${homeworkId}`}
        label={
          atLimit ? "Лимит вложений достигнут" : "Загрузить фото или файл"
        }
        multiple
        disabled={pending || atLimit}
        onUploaded={onUploaded}
      />

      {feedback.error ? (
        <p className="form-error" role="alert">
          {feedback.error}
        </p>
      ) : null}
      {feedback.message ? (
        <p className="homework-submit-ok" role="status">
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
