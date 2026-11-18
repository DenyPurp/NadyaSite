import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Images + common school documents */
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/rtf",
  "application/rtf",
]);

const EXT_MIME_FALLBACK: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".rtf": "application/rtf",
};

function safeFileName(original: string): string {
  const base = path.basename(original).replace(/[^\w.\-а-яА-ЯёЁ]+/gi, "_");
  const trimmed = base.slice(0, 80) || "file";
  const stamp = randomBytes(4).toString("hex");
  return `${Date.now()}-${stamp}-${trimmed}`;
}

function resolveMime(file: File): string {
  const typed = (file.type || "").toLowerCase().trim();
  if (typed && typed !== "application/octet-stream") {
    return typed;
  }
  const ext = path.extname(file.name).toLowerCase();
  return EXT_MIME_FALLBACK[ext] ?? typed;
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== Role.TEACHER && role !== Role.STUDENT)
  ) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан." }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Пустой файл." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Файл больше 8 МБ." },
      { status: 400 },
    );
  }

  const mime = resolveMime(file);
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json(
      {
        error:
          "Допустимы фото (JPEG, PNG, WebP, GIF, HEIC) и документы (PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, RTF).",
      },
      { status: 400 },
    );
  }

  const storedName = safeFileName(file.name);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const url = `/uploads/${storedName}`;
  return NextResponse.json({
    ok: true,
    url,
    fileName: file.name,
    mime,
  });
}
