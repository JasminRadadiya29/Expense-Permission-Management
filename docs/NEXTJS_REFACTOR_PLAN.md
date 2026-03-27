# Next.js Refactor Plan (Practical)

This plan reduces confusion without risky full rewrites.

## Target End State

- File-based UI routing in `app/` only
- No `react-router-dom` dependency
- Shared business logic in reusable server services
- Cleaner deploy path with predictable runtime boundaries

## Milestone 1 — Route Migration Skeleton

1. Create App Router pages for:
   - `/login`
   - `/signup`
   - `/change-password`
   - `/dashboard`
   - `/expenses`
   - `/approvals`
   - `/users`
   - `/approval-rules`
2. Keep existing view components from `src/views/*` and render them in these pages
3. Add an authenticated `app/(protected)/layout.jsx` wrapper for shared nav/layout

## Milestone 2 — Client Navigation Migration

1. Replace `react-router-dom` imports with:
   - `next/link`
   - `next/navigation` (`useRouter`, `usePathname`)
2. Remove `BrowserRouter`, `Routes`, `Route`, `Navigate`
3. Move role redirects into page-level guards with reusable helper hooks

## Milestone 3 — Dependency and Structure Cleanup

1. Remove `react-router-dom`
2. Remove catch-all bridge (`app/[...slug]/page.jsx`) once App Router is complete
3. Keep `app/api/**` as backend entrypoint
4. Optionally move `server/controllers` into `server/services` + thin handlers

## Milestone 4 — Quality Gates for Deploy

1. Enable ESLint during build (disable `ignoreDuringBuilds`)
2. Add CI checks:
   - `npm run lint`
   - `npm run build`
3. Add runtime health endpoint (optional)

## Risk Notes

- Migrating navigation touches many files; do it route-by-route
- Keep API contracts unchanged during UI migration
- Validate role-based route protection after each migrated page
