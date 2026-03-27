# Architecture & Flow

## 1) Startup Flow

1. Next.js starts (`npm run dev` or `npm start`)
2. `app/layout.jsx` renders base HTML shell
3. `app/page.jsx` loads `NextPageProviders` and `NextHomePage`
4. Home route redirects to `/login` or `/dashboard` based on auth state

## 2) Client Routing Flow

App routes are now file-based under `app/`:

- `/login`
- `/signup`
- `/change-password`
- `/dashboard`
- `/expenses`
- `/approvals`
- `/users`
- `/approval-rules`

Shared providers are applied via `src/components/NextPageProviders.jsx`:

- `ErrorBoundary`
- `ToastProvider`
- `AuthProvider`

Route protection:

- `NextProtectedRoute` blocks unauthenticated users
- Role checks gate Admin/Manager-only screens
- Dashboard route auto-selects view by role

## 3) Auth State Flow

`src/contexts/AuthContext.jsx`:

1. On app load, checks `localStorage` for token/user
2. If token exists -> restores session
3. If only refresh token exists -> calls `/api/auth/refresh`
4. On API 401 from interceptor -> clears storage + redirects to `/login`

## 4) API Request Pipeline

Frontend requests use `src/services/api.js` with base URL `/api`.

Each API handler in `app/api/**/route.js` calls:

`executeController(request, controller, options)` from `lib/routeHandler.js`.

Pipeline inside `executeController`:

1. `connectDB()` from `lib/db.js`
2. Parse JSON request body
3. Validate payload via `lib/validation.js` (if configured)
4. Run JWT `auth` middleware + role `authorize` middleware
5. Run target controller from `server/controllers/*`
6. Return `NextResponse.json(...)`

## 5) Domain Flows

## Auth

- `POST /api/auth/signup` -> create company + admin user + tokens
- `POST /api/auth/login` -> verify credentials + tokens
- `POST /api/auth/refresh` -> rotate access/refresh tokens
- `POST /api/auth/change-password` -> verify current + set new
- `POST /api/auth/forgot-password` -> temporary password flow
- `GET /api/auth/me` -> current user profile

## Users (Admin-centric)

- `GET /api/users` -> company users list
- `POST /api/users` -> create user with temporary password
- `PUT /api/users/:userId` -> role/manager updates
- `POST /api/users/:userId/reset-password` -> reset + temporary password
- `GET /api/users/managers` -> managers/admins list for assignment

## Expenses

- `GET /api/expenses` -> role-scoped list
- `POST /api/expenses` -> create draft expense
- `PUT /api/expenses/:expenseId` -> edit draft
- `POST /api/expenses/:expenseId/submit` -> create approval chain + set waiting status

## Approvals

- `GET /api/approvals/pending` -> pending approvals for approver
- `POST /api/approvals/:approvalId/process` -> approve/reject; may advance step or finish
- `GET /api/approvals` -> historical approvals for approver

## Approval Rules

- `GET /api/approval-rules`
- `POST /api/approval-rules`
- `PUT /api/approval-rules/:ruleId`
- `DELETE /api/approval-rules/:ruleId`

Only one active rule per company is enforced in controller logic.

## 6) Data Model Relationships

- `Company` 1 -> many `User`
- `User` (employee) 1 -> many `Expense`
- `Expense` 1 -> many `Approval`
- `ApprovalRule` belongs to `Company` and defines step structure

## 7) Why structure feels confusing today

- Legacy React Router files still exist in `src/` for reference, but primary runtime is now Next App Router
- `README.md` previously documented a Vite/Express architecture
- `server/routes` exists but is unused (actual APIs are `app/api/**`)

## 8) Recommended Next.js Standardization (phased)

Phase 1 (safe, done):

- Align docs with actual architecture
- Ensure production build/deploy path works

Phase 2 (incremental):

- Move route UI from React Router to file-based App Router pages under `app/`
- Replace `react-router-dom` hooks/components with `next/navigation` + `next/link`
- Keep existing controllers/models to avoid backend rewrite risk

Phase 3 (clean architecture):

- Move domain logic from `server/controllers` to `app/api`-friendly service modules
- Add server-only module boundaries and optional schema validation library
