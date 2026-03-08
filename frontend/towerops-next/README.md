# TowerOps Next.js Frontend (Phase A bootstrap)

This project is the initial implementation scaffold for the TowerOps admin frontend.

## Included foundation
- Next.js App Router + TypeScript + Tailwind
- React Query provider + Auth provider (session-backed)
- Axios API client with:
  - correlation/language headers
  - bearer token injection
  - single-retry 401 refresh flow
- Protected operations layout (`RequireAuth` + `AppShell`)
- Auth flow scaffold integrated with backend auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`)
- Initial operations slices:
  - `/dashboard`
  - `/sites`
  - `/assets`
  - `/visits`
  - `/workorders`
  - `/workorders/[id]`
  - `/checklist-templates`
  - `/sync`
  - `/privacy/data-export`
  - `/engineer/my-day`
  - `/materials`
  - `/escalations`
  - `/daily-plans`
  - `/analytics`
  - `/reports`
  - `/admin/users`
  - `/admin/offices`
  - `/admin/roles`
  - `/admin/settings`
  - `/portal/dashboard`
  - `/portal/workorders`
- Reusable UI primitives and feedback states:
  - `Button`, `Input`, `DataTable`, `Pagination`, `StatusBadge`, `ActionButton`
  - `LoadingState`, `ErrorState`, `EmptyState`
- Mutation workflows implemented:
  - work order lifecycle actions (`start`, `complete`, `close`, `cancel`)
  - portal customer actions (`accept`, `reject`)

## Run
```bash
npm install
npm run dev
```

Set API base URL with:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
