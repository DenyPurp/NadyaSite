"use client";

import { useId, useRef, useState, type DragEvent, type ChangeEvent } from "react";

type FileDropzoneProps = {
  name?: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onUploaded?: (info: { url: string; fileName: string }) => void;
};

const DEFAULT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf";

export function FileDropzone({
  name = "file",
  label = "Файл",
  accept = DEFAULT_ACCEPT,
  multiple = false,
  disabled = false,
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
      throw new Error(data.error ?? "Не удалось загрузить файл.");
    }
    return { url: data.url, fileName: data.fileName };
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      let lastUrl = "";
      let lastName: string | null = null;
      for (const file of list) {
        const result = await uploadFile(file);
        lastUrl = result.url;
        lastName = result.fileName;
        onUploaded?.(result);
      }
      if (lastName) setFileName(lastName);
      if (lastUrl) setFileUrl(lastUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сети при загрузке.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length) void uploadFiles(files);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const files = e.dataTransfer.files;
    if (files?.length) {
      void uploadFiles(multiple ? files : [files[0]!]);
    }
  }

  const busy = uploading || disabled;

  return (
    <div className="field">
      <label
        htmlFor={inputId}
        className={`file-dropzone${dragging ? " file-dropzone--active" : ""}${
          busy ? " file-dropzone--busy" : ""
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p className="file-dropzone-label">{label}</p>
        <p className="file-dropzone-hint">
          {uploading
            ? "Загружаем…"
            : multiple
              ? "Перетащите файлы сюда или нажмите, чтобы выбрать"
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
          multiple={multiple}
          onChange={onPick}
          disabled={busy}
          data-dropzone={name}
        />
      </label>
      {fileUrl && !onUploaded ? (
        <input type="hidden" name="fileUrl" value={fileUrl} />
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
