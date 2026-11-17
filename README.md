# NadyaSite

Next.js (App Router) + Prisma + PostgreSQL + Auth.js (NextAuth v5). Обучающий сайт: вход по логину/паролю, роли учитель/ученик.

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

Каркас Credentials (логин/пароль) в `src/auth.ts`, route `src/app/api/auth/[...nextauth]/route.ts`. Полноценный UI логина и админка — со следующих шагов.
