import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import {
  createCourseAction,
  createGoalAction,
  createHomeworkAction,
  createMaterialAction,
  deleteCourseAction,
  deleteGoalAction,
  deleteHomeworkAction,
  deleteMaterialAction,
  updateCourseAction,
} from "@/app/actions/admin";
import { auth } from "@/auth";
import { AdminForm } from "@/components/admin-form";
import { FileDropzone } from "@/components/file-dropzone";
import { GoalProgressControl } from "@/components/goal-progress-control";
import { LogoutButton } from "@/components/logout-button";
import { StudentAccounts } from "@/components/student-accounts";
import { lessonDateKey } from "@/lib/moscow-time";
import { prisma } from "@/lib/prisma";

async function AdminBody() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== Role.TEACHER) {
    redirect("/");
  }

  const [courses, students, materials, homeworks, goals] = await Promise.all([
    prisma.course.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { displayName: "asc" },
      select: {
        id: true,
        login: true,
        displayName: true,
        age: true,
        schoolClass: true,
      },
    }),
    prisma.material.findMany({
      orderBy: { createdAt: "desc" },
      include: { course: { select: { title: true } } },
      take: 40,
    }),
    prisma.homework.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        student: { select: { displayName: true, login: true } },
        submissions: {
          orderBy: { submittedAt: "asc" },
          select: {
            id: true,
            fileUrl: true,
            fileName: true,
            submittedAt: true,
          },
        },
      },
      take: 40,
    }),
    prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
      include: { student: { select: { displayName: true, login: true } } },
      take: 40,
    }),
  ]);

  return (
    <div className="admin">
      <header className="admin-hero">
        <p className="admin-kicker">Кабинет учителя</p>
        <h1 className="admin-title">Здравствуй, {session.user.displayName}</h1>
        <p className="admin-lead">
          Ученики, курсы, материалы, домашние задания и прогресс целей.
        </p>
      </header>

      <StudentAccounts students={students} />

      <div className="admin-grid">
        <section className="admin-section" aria-labelledby="courses-h">
          <h2 id="courses-h" className="admin-section-title">
            Курсы
          </h2>
          <AdminForm action={createCourseAction} submitLabel="Создать курс">
            <div className="field">
              <label htmlFor="course-title">Название</label>
              <input id="course-title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="course-desc">Описание</label>
              <textarea id="course-desc" name="description" rows={2} />
            </div>
          </AdminForm>

          <ul className="admin-list">
            {courses.map((course) => (
              <li key={course.id} className="admin-list-item">
                <AdminForm
                  action={updateCourseAction}
                  submitLabel="Обновить"
                  className="admin-form admin-form--inline"
                >
                  <input type="hidden" name="id" value={course.id} />
                  <div className="field">
                    <label htmlFor={`ct-${course.id}`}>Название</label>
                    <input
                      id={`ct-${course.id}`}
                      name="title"
                      defaultValue={course.title}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`cd-${course.id}`}>Описание</label>
                    <textarea
                      id={`cd-${course.id}`}
                      name="description"
                      rows={2}
                      defaultValue={course.description ?? ""}
                    />
                  </div>
                </AdminForm>
                <div className="admin-item-actions">
                  <AdminForm
                    action={deleteCourseAction}
                    submitLabel="Удалить курс"
                    danger
                    confirmMessage={`Удалить курс «${course.title}»? Связанные материалы и уроки тоже удалятся.`}
                    className="admin-form admin-form--row"
                  >
                    <input type="hidden" name="id" value={course.id} />
                  </AdminForm>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-section" aria-labelledby="materials-h">
          <h2 id="materials-h" className="admin-section-title">
            Теоретические материалы
          </h2>
          <AdminForm action={createMaterialAction} submitLabel="Добавить материал">
            <div className="field">
              <label htmlFor="mat-course">Курс</label>
              <select id="mat-course" name="courseId" required defaultValue="">
                <option value="" disabled>
                  Выберите курс
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="mat-title">Название</label>
              <input id="mat-title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="mat-type">Тип</label>
              <select id="mat-type" name="type" defaultValue="TEXT">
                <option value="TEXT">Текст</option>
                <option value="LINK">Ссылка</option>
                <option value="FILE">Файл</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="mat-content">Содержание</label>
              <textarea id="mat-content" name="content" rows={3} />
            </div>
            <FileDropzone label="Файл материала (перетащите или выберите)" />
            <div className="field">
              <label htmlFor="mat-url">Или URL файла / ссылки</label>
              <input id="mat-url" name="linkUrl" type="url" />
            </div>
          </AdminForm>

          <ul className="admin-list">
            {materials.map((mat) => (
              <li key={mat.id} className="admin-list-item">
                <p className="admin-item-title">
                  {mat.title}
                  <span className="admin-meta">
                    {" "}
                    · {mat.type} · {mat.course?.title ?? "без курса"}
                  </span>
                </p>
                {mat.content ? (
                  <p className="admin-item-body">{mat.content}</p>
                ) : null}
                {mat.fileUrl ? (
                  <p className="admin-meta">
                    Файл:{" "}
                    <a href={mat.fileUrl} target="_blank" rel="noreferrer">
                      {mat.fileUrl.split("/").pop()}
                    </a>
                  </p>
                ) : null}
                <AdminForm
                  action={deleteMaterialAction}
                  submitLabel="Удалить"
                  danger
                  confirmMessage={`Удалить материал «${mat.title}»?`}
                  className="admin-form admin-form--row"
                >
                  <input type="hidden" name="id" value={mat.id} />
                </AdminForm>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-section" aria-labelledby="hw-h">
          <h2 id="hw-h" className="admin-section-title">
            Домашние задания
          </h2>
          <p className="admin-note">
            Задания с датой для списка ученика («дата : задание»). Выдачи 10/20 —
            отдельно, позже.
          </p>
          <AdminForm action={createHomeworkAction} submitLabel="Назначить ДЗ">
            <div className="field">
              <label htmlFor="hw-student">Ученик</label>
              <select id="hw-student" name="studentId" required defaultValue="">
                <option value="" disabled>
                  Выберите ученика
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName} ({s.login})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="hw-date">Дата</label>
              <input id="hw-date" name="date" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="hw-title">Задание</label>
              <input id="hw-title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="hw-desc">Комментарий</label>
              <textarea id="hw-desc" name="description" rows={2} />
            </div>
            <FileDropzone
              label="Файл к заданию (необязательно)"
              name="hwFile"
            />
          </AdminForm>

          <ul className="admin-list">
            {homeworks.map((hw) => (
              <li key={hw.id} className="admin-list-item">
                <p className="admin-item-title">
                  {lessonDateKey(hw.date)} : {hw.title}
                </p>
                <p className="admin-meta">
                  {hw.student.displayName} ({hw.student.login})
                </p>
                {hw.description ? (
                  <p className="admin-item-body">{hw.description}</p>
                ) : null}
                {hw.submissions.length > 0 ? (
                  <div className="admin-hw-subs">
                    <p className="admin-meta">Ответ ученика:</p>
                    <ul className="admin-hw-files">
                      {hw.submissions.map((sub) => (
                        <li key={sub.id}>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={sub.fileName}
                            className="admin-hw-file-link"
                          >
                            {sub.fileName}
                          </a>
                          <span className="admin-meta">
                            {" "}
                            ·{" "}
                            {sub.submittedAt.toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="admin-meta">Вложений пока нет.</p>
                )}
                <AdminForm
                  action={deleteHomeworkAction}
                  submitLabel="Удалить ДЗ"
                  danger
                  confirmMessage={`Удалить задание «${hw.title}»?`}
                  className="admin-form admin-form--row"
                >
                  <input type="hidden" name="id" value={hw.id} />
                </AdminForm>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-section" aria-labelledby="goals-h">
          <h2 id="goals-h" className="admin-section-title">
            Цели и прогресс
          </h2>
          <AdminForm action={createGoalAction} submitLabel="Добавить цель">
            <div className="field">
              <label htmlFor="goal-student">Ученик</label>
              <select id="goal-student" name="studentId" required defaultValue="">
                <option value="" disabled>
                  Выберите ученика
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName} ({s.login})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="goal-title">Цель</label>
              <input id="goal-title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="goal-progress">Прогресс %</label>
              <input
                id="goal-progress"
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={0}
              />
            </div>
          </AdminForm>

          <ul className="admin-list">
            {goals.map((goal) => (
              <li key={goal.id} className="admin-list-item">
                <p className="admin-item-title">{goal.title}</p>
                <p className="admin-meta">
                  {goal.student.displayName} · сейчас {goal.progress}%
                </p>
                <GoalProgressControl
                  goalId={goal.id}
                  initialProgress={goal.progress}
                  trailing={
                    <AdminForm
                      action={deleteGoalAction}
                      submitLabel="Удалить"
                      danger
                      confirmMessage={`Удалить цель «${goal.title}»?`}
                      className="goal-admin-delete"
                    >
                      <input type="hidden" name="id" value={goal.id} />
                    </AdminForm>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="home-stage home-stage--admin">
      <header className="home-bar home-bar--dash">
        <p className="admin-brand-mini">Cozy English with Nadya</p>
        <LogoutButton />
      </header>
      <Suspense
        fallback={
          <div className="admin">
            <p className="admin-lead">Загружаем кабинет учителя…</p>
          </div>
        }
      >
        <AdminBody />
      </Suspense>
    </main>
  );
}
