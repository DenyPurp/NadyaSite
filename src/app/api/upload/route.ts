import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeFileName(original: string): string {
  const base = path.basename(original).replace(/[^\w.\-а-яА-ЯёЁ]+/gi, "_");
  const trimmed = base.slice(0, 80) || "file";
  const stamp = randomBytes(4).toString("hex");
  return `${Date.now()}-${stamp}-${trimmed}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.TEACHER) {
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

  const storedName = safeFileName(file.name);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const url = `/uploads/${storedName}`;
  return NextResponse.json({
    ok: true,
    url,
    fileName: file.name,
  });
}
