import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const CALENDAR_TZ = "Europe/Moscow";

type SeedUser = {
  login: string;
  password: string;
  displayName: string;
  role: Role;
};

/** Plain passwords are for local/dev seeding only — see README. */
const SEED_USERS: SeedUser[] = [
  {
    login: "teacher",
    password: "teacher123",
    displayName: "Надя (учитель)",
    role: Role.TEACHER,
  },
  {
    login: "student1",
    password: "student123",
    displayName: "Анна Ученица",
    role: Role.STUDENT,
  },
  {
    login: "student2",
    password: "student123",
    displayName: "Иван Ученик",
    role: Role.STUDENT,
  },
];

function moscowTodayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CALENDAR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + deltaDays);
  const dt = new Date(utc);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function utcDateFromDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00.000Z`);
}

type SampleLesson = {
  offsetDays: number;
  topic: string;
  notes: string;
};

/** Relative to “today” in Europe/Moscow so the calendar demo stays populated. */
const STUDENT1_LESSONS: SampleLesson[] = [
  {
    offsetDays: -2,
    topic: "Present Perfect: уже / ещё / just",
    notes:
      "Разобрали already, yet, just. Дома: 8 предложений про свою неделю. Анна путала for/since — повторили на примерах.",
  },
  {
    offsetDays: -5,
    topic: "Small talk: weekend plans",
    notes:
      "Диалоги про выходные. Фразы: I’m thinking of… / How about…? Произношение th в think / that.",
  },
  {
    offsetDays: -12,
    topic: "Past Simple vs Past Continuous",
    notes:
      "Картинки «что происходило, когда…». Ключ: was/were + V-ing для фона, Past Simple для события.",
  },
  {
    offsetDays: -19,
    topic: "Vocabulary: travel & airports",
    notes:
      "20 слов: boarding pass, gate, delay. Мини-ролевая у стойки регистрации. ДЗ: описать воображаемую поездку.",
  },
  {
    offsetDays: -28,
    topic: "Conditionals 0 & 1",
    notes:
      "If it rains… / If you heat ice… Схема на доске. Устная практика: советы другу перед экзаменом.",
  },
  {
    offsetDays: -40,
    topic: "Listening: café dialogue",
    notes:
      "Аудио B1 — заказ в кафе. Выписали would like / could I have. Отработали интонацию вежливой просьбы.",
  },
  {
    offsetDays: -55,
    topic: "Writing: short email to a teacher",
    notes:
      "Структура: greeting → reason → ask → closing. Исправили Dear teacher на Dear Nadya. Homework: письмо на 80–100 слов.",
  },
];

async function main() {
  for (const user of SEED_USERS) {
    const passwordHash = await hash(user.password, BCRYPT_ROUNDS);

    await prisma.user.upsert({
      where: { login: user.login },
      create: {
        login: user.login,
        passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
      update: {
        passwordHash,
        displayName: user.displayName,
        role: user.role,
      },
    });

    console.log(`Seeded ${user.role}: ${user.login}`);
  }

  const student1 = await prisma.user.findUniqueOrThrow({
    where: { login: "student1" },
  });

  const course = await prisma.course.upsert({
    where: { id: "seed-course-general-english" },
    create: {
      id: "seed-course-general-english",
      title: "General English B1",
      description: "Личный курс Анны: разговорная практика и грамматика.",
    },
    update: {
      title: "General English B1",
      description: "Личный курс Анны: разговорная практика и грамматика.",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student1.id,
        courseId: course.id,
      },
    },
    create: {
      studentId: student1.id,
      courseId: course.id,
    },
    update: {},
  });

  // Replace demo lessons for student1 so re-seed stays idempotent and calendar-friendly.
  await prisma.lesson.deleteMany({ where: { studentId: student1.id } });

  const todayKey = moscowTodayKey();
  for (const sample of STUDENT1_LESSONS) {
    const dayKey = shiftDayKey(todayKey, sample.offsetDays);
    await prisma.lesson.create({
      data: {
        date: utcDateFromDayKey(dayKey),
        topic: sample.topic,
        notes: sample.notes,
        courseId: course.id,
        studentId: student1.id,
      },
    });
    console.log(`Seeded lesson ${dayKey}: ${sample.topic}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
