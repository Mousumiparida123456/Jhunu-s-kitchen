# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Database (Local SQLite + Prisma) + API

This project is a Vite + React frontend. Prisma uses a local SQLite database file in this repo, and the API is provided in two ways:
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

### 3) Create local DB schema

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
- `http://localhost:5173/delivery` (place an order, saved in DB)
- `http://localhost:5173/admin` (orders + status updates)
- `http://localhost:5173/track` (tracks by Order ID)

## UPI payment request SMS (Razorpay Payment Links)

When a user selects UPI and submits payment on `/delivery`, the app:
1) creates the order in SQLite, then
2) calls `POST /api/payments/create` which creates a Razorpay Payment Link and triggers SMS via Razorpay (`notify.sms: true`).
