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
  - `/login`
  - `/forgot-password`
  - `/reset-password`
  - `/change-password`
  - `/mfa/setup`
  - `/mfa/verify`
  - `/dashboard`
  - `/analytics`
  - `/analytics/engineers/[engineerId]`
  - `/analytics/sites/[siteId]`
  - `/analytics/offices/[officeId]`
  - `/analytics/materials/[materialId]`
  - `/analytics/issues`
  - `/reports`
  - `/reports/visits/[visitId]`
  - `/reports/scorecard`
  - `/reports/checklist`
  - `/reports/bdt`
  - `/reports/data-collection`
  - `/sites`
  - `/sites/new`
  - `/sites/[siteId]`
  - `/sites/[siteId]/edit`
  - `/sites/import`
  - `/workorders`
  - `/workorders/new`
  - `/workorders/[id]`
  - `/workorders/[id]/acceptance`
  - `/visits`
  - `/visits/new`
  - `/visits/[id]`
  - `/visits/[id]/edit`
  - `/assets`
  - `/assets/faulty`
  - `/assets/expiring-warranties`
  - `/assets/[assetCode]`
  - `/assets/[assetCode]/history`
  - `/assets/[assetCode]/actions`
  - `/escalations`
  - `/escalations/new`
  - `/escalations/[id]`
  - `/operations/daily-plans`
  - `/operations/daily-plans/[planId]/[date]` (office/date route semantics)
  - `/operations/daily-plans/[planId]?officeId=...&date=...`
  - `/operations/checklist-templates`
  - `/operations/checklist-templates/new`
  - `/operations/checklist-templates/[id]`
  - `/operations/checklist-templates/history`
  - `/operations/checklist-templates/import`
  - `/admin/users`
  - `/admin/users/new`
  - `/admin/users/[userId]`
  - `/admin/users/[userId]/edit`
  - `/admin/users/[userId]/performance`
  - `/admin/offices`
  - `/admin/offices/new`
  - `/admin/offices/[officeId]`
  - `/admin/offices/[officeId]/edit`
  - `/admin/offices/[officeId]/statistics`
  - `/admin/roles`
  - `/admin/roles/new`
  - `/admin/roles/[id]`
  - `/admin/roles/[id]/edit`
  - `/admin/roles/permissions`
  - `/admin/settings`
  - `/admin/settings/[group]`
  - `/admin/settings/test-services`
  - `/inventory/materials`
  - `/inventory/materials/new`
  - `/inventory/materials/[id]`
  - `/inventory/materials/transactions`
  - `/engineer/my-day`
  - `/engineer/sync`
  - `/engineer/sync/conflicts`
  - `/engineer/visits/[id]/execute`
  - `/engineer/visits/[id]/evidence`
  - `/reviews/visits`
  - `/reviews/visits/[visitId]`
  - `/operations/sync-monitor`
  - `/portal/dashboard`
  - `/portal/sites`
  - `/portal/sites/[siteCode]`
  - `/portal/workorders`
  - `/portal/sla-report`
  - `/portal/visits/[id]` (site-code or visit-id context route)
  - `/portal/visits/[id]/evidence`
  - `/privacy/data-export`
  - `/privacy/data-export/history`
- Reusable UI primitives and feedback states:
  - `Button`, `Input`, `DataTable`, `Pagination`, `StatusBadge`
  - `LoadingState`, `ErrorState`, `EmptyState`
- Lifecycle mutations wired for:
  - auth `forgot-password`, `reset-password`, `change-password`, `mfa/setup`, `mfa/verify`
  - work order `start`, `complete`, `submit-for-acceptance`, `close`, `cancel`
  - work order `create`, `assign`, `customer-accept`, `customer-reject`, `signature capture/get`
  - visit `create`, `start`, `complete`, `submit`, `cancel`, `reschedule`
  - visit evidence `checklist add/update`, `issue add/resolve`, `reading add/update`, `photo add/remove`, `signature capture`, `panorama/alarms/unused-assets import`
  - site `create`, `update`, `import` (master, site-assets, power, radio, tx, sharing, rf-status, bdt, delta-sites)
  - escalation `review`, `approve`, `reject`, `close`
  - asset `service`, `fault`, `replace`
  - material `create`, `stock add`, `stock reserve`, `stock consume`
  - daily plan `create`, `assign`, `remove`, `suggest-order`, `publish`
  - checklist template `create`, `activate`, `import`
  - user `create`, `update`, `delete`, `change-role`, `activate`, `deactivate`, `unlock-account`
  - office `create`, `update`, `update-contact`, `delete`
  - role `create`, `update`, `delete`
  - settings `upsert`, `test-service`
  - portal work order `accept`, `reject`
  - privacy export `request`, `download`

## Run
```bash
npm install
npm run dev
```

Set API base URL with:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
