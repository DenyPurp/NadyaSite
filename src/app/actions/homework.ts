"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type HomeworkActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  submissionId?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt?: string;
};

const UPLOAD_URL_RE = /^\/uploads\/[A-Za-z0-9._\-а-яА-ЯёЁ]+$/;

function isSafeUploadUrl(url: string): boolean {
  if (!UPLOAD_URL_RE.test(url)) return false;
  if (url.includes("..") || url.includes("//")) return false;
  return true;
}

export async function attachHomeworkFileAction(
  _prev: HomeworkActionState,
  formData: FormData,
): Promise<HomeworkActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.STUDENT) {
    return { error: "Нет доступа." };
  }

  const homeworkId = String(formData.get("homeworkId") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const fileName = String(formData.get("fileName") ?? "").trim().slice(0, 160);

  if (!homeworkId || !fileUrl || !fileName) {
    return { error: "Нужны задание и файл." };
  }
  if (!isSafeUploadUrl(fileUrl)) {
    return { error: "Некорректный путь к файлу." };
  }

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, studentId: session.user.id },
    select: { id: true },
  });
  if (!homework) {
    return { error: "Задание не найдено." };
  }

  const existingCount = await prisma.homeworkSubmission.count({
    where: { homeworkId, studentId: session.user.id },
  });
  if (existingCount >= 12) {
    return { error: "Не больше 12 вложений на одно задание." };
  }

  const created = await prisma.homeworkSubmission.create({
    data: {
      homeworkId,
      studentId: session.user.id,
      fileUrl,
      fileName,
    },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      submittedAt: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return {
    ok: true,
    message: "Файл прикреплён.",
    submissionId: created.id,
    fileUrl: created.fileUrl,
    fileName: created.fileName,
    submittedAt: created.submittedAt.toISOString(),
  };
}

export async function removeHomeworkFileAction(
  _prev: HomeworkActionState,
  formData: FormData,
): Promise<HomeworkActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.STUDENT) {
    return { error: "Нет доступа." };
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) {
    return { error: "Нет id вложения." };
  }

  const submission = await prisma.homeworkSubmission.findFirst({
    where: { id: submissionId, studentId: session.user.id },
    select: { id: true },
  });
  if (!submission) {
    return { error: "Вложение не найдено." };
  }

  await prisma.homeworkSubmission.delete({ where: { id: submissionId } });

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Вложение удалено." };
}
