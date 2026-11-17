# Cozy English with Nadya (NadyaSite)

Next.js (App Router) + Prisma + PostgreSQL + Auth.js (NextAuth v5). Уютный кабинет английского: вход по логину/паролю, роли учитель/ученик, календарь занятий ученика (таймзона `Europe/Moscow`).

## Быстрый старт

```bash
git clone https://github.com/DenyPurp/NadyaSite.git
cd NadyaSite
cp .env.example .env
# заполните DATABASE_URL и AUTH_SECRET в .env (см. ниже)
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Альтернативы: `npm run prisma:migrate` и `npm run prisma:seed`.

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения. Файл `.env` в git не коммитится.

| Переменная | Назначение | Откуда взять |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Neon / локальный Postgres / другой хостинг. Формат: `postgresql://USER:PASSWORD@HOST:PORT/DB` |
| `AUTH_SECRET` | Секрет сессий Auth.js | Сгенерировать: `openssl rand -base64 32` |
| `AUTH_URL` | Базовый URL приложения | Для локали оставьте `http://localhost:3000` |

Без `DATABASE_URL` можно установить зависимости и собрать проект (`npm install`, `npm run build`) — клиент Prisma генерируется без живой БД. `migrate deploy` и `db seed` нужны только когда Postgres доступен.

## Prisma / PostgreSQL

- Схема: `prisma/schema.prisma`
- Миграции: `prisma/migrations/`
- Seed: `prisma/seed.ts` (`npx prisma db seed`)
- Singleton клиента: `src/lib/prisma.ts`

## Тестовые учётные записи (после seed)

Только для локальной разработки. Не используйте в продакшене.

| Логин | Пароль | Роль |
|---|---|---|
| `teacher` | `teacher123` | TEACHER |
| `student1` | `student123` | STUDENT |
| `student2` | `student123` | STUDENT |

Seed идемпотентен: повторный запуск обновляет тех же пользователей по `login`.

## Auth.js

Credentials (логин/пароль) в `src/auth.ts`, route `src/app/api/auth/[...nextauth]/route.ts`.

- Страница входа: `/login` (без саморегистрации)
- После входа: ученик → `/` (приветствие, компактный календарь, ДЗ, цели); учитель → `/admin`
- Защита маршрутов: `src/proxy.ts` (Next.js 16; бывший middleware) + `src/auth.config.ts` (роль `TEACHER` для `/admin`)
- Выход: кнопка «Выйти»
- Seed для `student1`: курс, уроки, материалы, домашние задания (`Homework`) и цели (`Goal`) с прогрессом
- Временный переключатель сезона на главной ученика (cookie override) — только для теста палитры
- Выдачи 10/20 (`AssignmentIssue`) — зарезервированная панель на дашборде, без CRUD в этой версии
