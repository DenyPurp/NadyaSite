# NadyaSite

Next.js (App Router) + Prisma + PostgreSQL. Шаг 0.2: схема БД и первая миграция.

## Getting Started

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Prisma / PostgreSQL

Схема: `prisma/schema.prisma`. SQL миграции: `prisma/migrations/` (первая — `init`).

**Живой `DATABASE_URL` в этом шаге не обязателен.** Клиент генерируется при `npm install` / `npm run build`. Применить миграции к Postgres — когда появится URL:

1. Создайте локальный `.env` (не коммитить) с `DATABASE_URL=postgresql://...`
2. `npx prisma migrate deploy` (или `npm run prisma:migrate`)

Для локальной разработки с записью в БД также подойдёт `npx prisma migrate dev`.

Singleton клиента: `src/lib/prisma.ts`.

