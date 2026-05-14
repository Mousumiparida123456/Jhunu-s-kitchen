# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Backend + Database (Self-hosted Postgres + Prisma)

This project has:
- React frontend (Vite)
- Node/Express backend (`server/*` + `api/*`)
- Prisma ORM with PostgreSQL

You can run your own PostgreSQL with Docker (no Supabase dependency).

## 1) Install dependencies

```bash
npm install
```

## 2) Start PostgreSQL locally (Docker)

```bash
docker compose up -d
```

This uses [`docker-compose.yml`](./docker-compose.yml) and creates a local DB:
- host: `localhost`
- port: `5432`
- db: `jhunu_kitchen`
- user: `postgres`
- password: `postgres`

## 3) Create env file

```bash
copy .env.example .env
```

## 4) Generate Prisma client + apply schema + seed

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## 5) Run backend + frontend

```bash
npm run dev:full
```

Then open:
- `http://localhost:5173/menu`
- `http://localhost:5173/delivery`
- `http://localhost:5173/admin`
- `http://localhost:5173/track`

## Production (without Supabase)

Use any PostgreSQL you control (for example: your VPS Docker Postgres, Railway Postgres, Neon, Render Postgres, or managed PG on cloud VM).

Set these env vars in your hosting platform:
- `DATABASE_URL` = pooled/runtime Postgres URL
- `DIRECT_URL` = direct Postgres URL (for Prisma migrations/push)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `API_PORT` (optional; defaults to `5174` locally)

After setting DB URLs, run once:

```bash
npm run db:push
npm run db:seed
```

## UPI payment request SMS (Razorpay Payment Links)

When a user selects UPI and submits payment on `/delivery`, the app:
1) creates the order in PostgreSQL, then
2) calls `POST /api/payments/create` to create a Razorpay Payment Link and trigger SMS (`notify.sms: true`).
