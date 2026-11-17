import { prisma } from "@/lib/prisma";
import { lessonDateKey } from "@/lib/moscow-time";

export type StudentLessonDTO = {
  id: string;
  dateKey: string;
  topic: string;
  notes: string | null;
};

/** Lessons for one student only — used by the student calendar. */
export async function getStudentLessons(
  studentId: string,
): Promise<StudentLessonDTO[]> {
  const rows = await prisma.lesson.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      topic: true,
      notes: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    dateKey: lessonDateKey(row.date),
    topic: row.topic,
    notes: row.notes,
  }));
}
