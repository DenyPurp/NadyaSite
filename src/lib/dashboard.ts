import { prisma } from "@/lib/prisma";
import { lessonDateKey } from "@/lib/moscow-time";

export type HomeworkDTO = {
  id: string;
  dateKey: string;
  title: string;
  description: string | null;
};

export type GoalDTO = {
  id: string;
  title: string;
  progress: number;
};

export async function getStudentHomework(
  studentId: string,
): Promise<HomeworkDTO[]> {
  const rows = await prisma.homework.findMany({
    where: { studentId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      title: true,
      description: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    dateKey: lessonDateKey(row.date),
    title: row.title,
    description: row.description,
  }));
}

export async function getStudentGoals(studentId: string): Promise<GoalDTO[]> {
  const rows = await prisma.goal.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      progress: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    progress: Math.min(100, Math.max(0, row.progress)),
  }));
}
