"use server";

import { revalidatePath } from "next/cache";
import { MaterialType, Role } from "@prisma/client";
import { auth } from "@/auth";
import { utcDateFromDayKey } from "@/lib/moscow-time";
import { prisma } from "@/lib/prisma";

export type AdminActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

async function requireTeacher() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== Role.TEACHER) {
    return null;
  }
  return session;
}

function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export async function createCourseAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { error: "Укажите название курса." };
  }

  await prisma.course.create({
    data: {
      title,
      description: description || null,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Курс создан." };
}

export async function updateCourseAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!id || !title) {
    return { error: "Нужны id и название курса." };
  }

  await prisma.course.update({
    where: { id },
    data: {
      title,
      description: description || null,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Курс обновлён." };
}

export async function createMaterialAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "TEXT").trim();
  const content = String(formData.get("content") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "").trim();

  if (!title || !courseId) {
    return { error: "Укажите название и курс." };
  }

  const type =
    typeRaw === "FILE" || typeRaw === "LINK" || typeRaw === "TEXT"
      ? (typeRaw as MaterialType)
      : MaterialType.TEXT;

  await prisma.material.create({
    data: {
      title,
      type,
      content: content || null,
      fileUrl: fileUrl || null,
      courseId,
    },
  });

  revalidatePath("/admin");
  return { ok: true, message: "Материал добавлен." };
}

export async function deleteMaterialAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Нет id материала." };
  }

  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true, message: "Материал удалён." };
}

export async function createHomeworkAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const dateKey = String(formData.get("date") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!studentId || !dateKey || !title) {
    return { error: "Укажите ученика, дату и задание." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { error: "Дата в формате YYYY-MM-DD." };
  }

  await prisma.homework.create({
    data: {
      studentId,
      date: utcDateFromDayKey(dateKey),
      title,
      description: description || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Домашнее задание добавлено." };
}

export async function deleteHomeworkAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Нет id задания." };
  }

  await prisma.homework.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Задание удалено." };
}

export async function createGoalAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const progress = clampProgress(Number(formData.get("progress") ?? 0));

  if (!studentId || !title) {
    return { error: "Укажите ученика и цель." };
  }

  await prisma.goal.create({
    data: {
      studentId,
      title,
      progress,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Цель создана." };
}

export async function updateGoalProgressAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const progress = clampProgress(Number(formData.get("progress") ?? 0));

  if (!id) {
    return { error: "Нет id цели." };
  }

  await prisma.goal.update({
    where: { id },
    data: { progress },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Прогресс обновлён." };
}

export async function deleteGoalAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await requireTeacher())) {
    return { error: "Нет доступа." };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { error: "Нет id цели." };
  }

  await prisma.goal.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: "Цель удалена." };
}
