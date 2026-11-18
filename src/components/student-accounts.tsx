"use client";

import { useMemo, useState } from "react";
import {
  createStudentAction,
  resetStudentPasswordAction,
  updateStudentAction,
} from "@/app/actions/admin";
import { AdminForm } from "@/components/admin-form";

export type StudentAccountRow = {
  id: string;
  login: string;
  displayName: string;
  age: number | null;
  schoolClass: string | null;
};

type StudentAccountsProps = {
  students: StudentAccountRow[];
};

export function StudentAccounts({ students }: StudentAccountsProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.login.toLowerCase().includes(q) ||
        (s.schoolClass?.toLowerCase().includes(q) ?? false),
    );
  }, [students, query]);

  return (
    <section className="admin-section admin-section--wide" aria-labelledby="students-h">
      <h2 id="students-h" className="admin-section-title">
        Ученики
      </h2>
      <p className="admin-note">
        Аккаунты создаёт только учитель. Передайте ученику логин и временный
        пароль — самостоятельной регистрации нет.
      </p>

      <AdminForm action={createStudentAction} submitLabel="Создать ученика">
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="stu-login">Логин</label>
            <input
              id="stu-login"
              name="login"
              autoComplete="off"
              required
              placeholder="anna.ivanova"
            />
          </div>
          <div className="field">
            <label htmlFor="stu-password">Временный пароль</label>
            <input
              id="stu-password"
              name="tempPassword"
              type="text"
              autoComplete="new-password"
              placeholder="оставьте пустым — сгенерируем"
            />
          </div>
          <div className="field">
            <label htmlFor="stu-name">ФИО / имя</label>
            <input id="stu-name" name="displayName" required />
          </div>
          <div className="field">
            <label htmlFor="stu-age">Возраст</label>
            <input
              id="stu-age"
              name="age"
              type="number"
              min={5}
              max={25}
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label htmlFor="stu-class">Класс</label>
            <input
              id="stu-class"
              name="schoolClass"
              placeholder="7А"
              maxLength={16}
            />
          </div>
        </div>
      </AdminForm>

      <div className="field student-search">
        <label htmlFor="stu-search">Поиск по имени или логину</label>
        <input
          id="stu-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Начните вводить…"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="admin-note">
          {students.length === 0
            ? "Пока нет учеников — создайте первого выше."
            : "Никого не нашли по этому запросу."}
        </p>
      ) : (
        <ul className="admin-list">
          {filtered.map((student) => (
            <li key={student.id} className="admin-list-item">
              <p className="admin-item-title">
                {student.displayName}
                <span className="admin-meta"> · {student.login}</span>
              </p>
              <p className="admin-meta">
                {student.age != null ? `${student.age} лет` : "возраст не указан"}
                {" · "}
                {student.schoolClass
                  ? `класс ${student.schoolClass}`
                  : "класс не указан"}
              </p>

              <AdminForm
                action={updateStudentAction}
                submitLabel="Сохранить"
                className="admin-form admin-form--inline"
              >
                <input type="hidden" name="id" value={student.id} />
                <div className="admin-form-grid">
                  <div className="field">
                    <label htmlFor={`sn-${student.id}`}>ФИО / имя</label>
                    <input
                      id={`sn-${student.id}`}
                      name="displayName"
                      defaultValue={student.displayName}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`sa-${student.id}`}>Возраст</label>
                    <input
                      id={`sa-${student.id}`}
                      name="age"
                      type="number"
                      min={5}
                      max={25}
                      defaultValue={student.age ?? ""}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`sc-${student.id}`}>Класс</label>
                    <input
                      id={`sc-${student.id}`}
                      name="schoolClass"
                      defaultValue={student.schoolClass ?? ""}
                      maxLength={16}
                      placeholder="7А"
                    />
                  </div>
                </div>
              </AdminForm>

              <AdminForm
                action={resetStudentPasswordAction}
                submitLabel="Сбросить пароль"
                danger
                confirmMessage={`Сбросить пароль для «${student.displayName}»?`}
                className="admin-form admin-form--inline"
              >
                <input type="hidden" name="id" value={student.id} />
                <div className="field">
                  <label htmlFor={`sp-${student.id}`}>
                    Новый временный пароль
                  </label>
                  <input
                    id={`sp-${student.id}`}
                    name="tempPassword"
                    type="text"
                    autoComplete="new-password"
                    placeholder="пусто — сгенерируем"
                  />
                </div>
              </AdminForm>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
