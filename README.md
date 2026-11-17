# NadyaSite

Next.js (App Router) + Prisma + PostgreSQL. Шаг 0.3: переменные окружения.

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения. Файл `.env` в git не коммитится.

| Переменная | Назначение | Откуда взять |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Neon / локальный Postgres / другой хостинг. Формат: `postgresql://USER:PASSWORD@HOST:PORT/DB` |
| `AUTH_SECRET` | Секрет сессий Auth.js | Сгенерировать: `openssl rand -base64 32` (или любой длинный случайный строковый секрет) |
| `AUTH_URL` | Базовый URL приложения | Для локали оставьте `http://localhost:3000` |

## Prisma / PostgreSQL

Схема: `prisma/schema.prisma`. SQL миграции: `prisma/migrations/` (первая — `init`).

**Живой `DATABASE_URL` в этом шаге не обязателен.** Клиент генерируется при `npm install` / `npm run build`. Применить миграции к Postgres — когда появится URL:

1. Заполните `DATABASE_URL` в локальном `.env`
2. `npx prisma migrate deploy` (или `npm run prisma:migrate`)

Для локальной разработки с записью в БД также подойдёт `npx prisma migrate dev`.

Singleton клиента: `src/lib/prisma.ts`.

