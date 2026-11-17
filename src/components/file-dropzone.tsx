"use client";

import { useId, useRef, useState, type DragEvent, type ChangeEvent } from "react";

type FileDropzoneProps = {
  name?: string;
  label?: string;
  accept?: string;
  onUploaded?: (info: { url: string; fileName: string }) => void;
};

export function FileDropzone({
  name = "file",
  label = "Файл",
  accept,
  onUploaded,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        fileName?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url || !data.fileName) {
        setError(data.error ?? "Не удалось загрузить файл.");
        return;
      }
      setFileName(data.fileName);
      setFileUrl(data.url);
      onUploaded?.({ url: data.url, fileName: data.fileName });
    } catch {
      setError("Ошибка сети при загрузке.");
    } finally {
      setUploading(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="field">
      <label
        htmlFor={inputId}
        className={`file-dropzone${dragging ? " file-dropzone--active" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p className="file-dropzone-label">{label}</p>
        <p className="file-dropzone-hint">
          {uploading
            ? "Загружаем…"
            : "Перетащите файл сюда или нажмите, чтобы выбрать"}
        </p>
        {fileName ? (
          <p className="file-dropzone-name" aria-live="polite">
            {fileName}
          </p>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={onPick}
          disabled={uploading}
          data-dropzone={name}
        />
      </label>
      {fileUrl ? <input type="hidden" name="fileUrl" value={fileUrl} /> : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
