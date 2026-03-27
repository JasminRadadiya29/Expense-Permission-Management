# ExpenseFlow (Next.js)

ExpenseFlow is a full-stack expense approval system built on Next.js App Router with MongoDB.

## What this project is

- Single Next.js application for UI + API routes (`app/api/**`)
- React client-side dashboard UI (role-based)
- JWT auth + refresh token flow
- Multi-step approval rules (all / percentage / specific / hybrid)

## Runtime Architecture (Actual)

1. Browser loads App Router pages in `app/` (`/`, `/login`, `/dashboard`, `/expenses`, ...)
2. Each page wraps content with shared providers (`ErrorBoundary`, `ToastProvider`, `AuthProvider`)
3. Frontend calls `/api/*` through `src/services/api.js`
4. Next route handlers in `app/api/**/route.js` call `executeController(...)`
5. `lib/routeHandler.js` runs: DB connect -> validation -> auth/authorize -> controller
6. Controllers (`server/controllers/*`) read/write MongoDB via Mongoose models

For a detailed flow map, see `docs/ARCHITECTURE.md`.

## Tech Stack

- Next.js 15 (App Router)
- React 18
- Tailwind CSS
- MongoDB + Mongoose
- JWT auth
- EmailJS (client-triggered transactional email)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB connection string

### 1) Install

```bash
npm install
```

### 2) Configure env

Copy `.env.example` to `.env.local` and fill values.

Required keys:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

### 3) Run locally

```bash
npm run dev
```

App URL: `http://localhost:3000`

### 4) Production build check

```bash
npm run build
npm start
```

## Deployment Notes

- `next.config.mjs` uses `output: 'standalone'` for container-friendly deployment
- Deployable to Vercel, Render, Railway, Fly.io, or self-hosted Node runtime
- Make sure production environment variables are set before start

## Important Security Note

If real credentials were committed in `.env`/`.env.local`, rotate them immediately (MongoDB password, JWT secret, EmailJS keys).

## Project Structure (Current)

```text
app/                    # Next.js App Router pages + API route handlers
lib/                    # DB connection, request pipeline, validations
server/
	controllers/          # Business logic per domain
	middleware/           # JWT auth + role authorization
	models/               # Mongoose schemas
src/                    # Client UI app, views, components, context, API client
docs/                   # Architecture and refactor guidance
```
