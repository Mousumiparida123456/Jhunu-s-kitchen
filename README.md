# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Database (Postgres + Prisma) + API

This project is a Vite + React frontend. To add a real database, Prisma is used for Postgres and an API is provided in two ways:
- Local dev API server: `server/devServer.js`
- Vercel serverless functions: `api/*`

### 1) Install dependencies

```bash
npm install
```

### 2) Create your env file

```bash
copy .env.example .env
```

### 3) Push schema to the database

```bash
npm run db:push
```

### 4) Seed menu items

```bash
npm run db:seed
```

### 5) Run API + frontend together

```bash
npm run dev:full
```

Then open the app and check:
- `http://localhost:5173/menu` (menu loads from DB)
- `http://localhost:5173/delivery` → place an order (saved in DB)
- `http://localhost:5173/admin` (orders + status updates)
- `http://localhost:5173/track` (tracks by Order ID)

## Deploy on Vercel

### 1) Create a Postgres database

In your Vercel project dashboard, create a Postgres database (Storage). Copy the connection strings.

### 2) Set env vars in Vercel

Set these in Vercel (Project → Settings → Environment Variables):
- `DATABASE_URL` = your pooled/runtime connection string (Prisma/pgbouncer is OK)
- `DIRECT_URL` = your non-pooled/direct connection string (recommended for Prisma schema pushes/migrations)
- `RAZORPAY_KEY_ID` = Razorpay key id
- `RAZORPAY_KEY_SECRET` = Razorpay key secret

### 3) Push schema + seed (one-time)

From your local machine (with the same env vars in `.env`):

```bash
npm run db:push
npm run db:seed
```

### 4) Deploy

Push to GitHub and import the repo in Vercel. Vercel will build the frontend (`vite build`) and serve API routes from `api/*`. React Router refreshes work because `vercel.json` rewrites to `index.html`.

## UPI payment request SMS (Razorpay Payment Links)

When a user selects UPI and submits payment on `/delivery`, the app:
1) creates the order in Postgres, then
2) calls `POST /api/payments/create` which creates a Razorpay Payment Link and triggers SMS via Razorpay (`notify.sms: true`).
