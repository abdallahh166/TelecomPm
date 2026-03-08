# TowerOps Next.js Frontend (Phase A bootstrap)

This project is the initial implementation scaffold for the TowerOps admin frontend.

## Included foundation
- Next.js App Router + TypeScript + Tailwind
- React Query provider
- Axios API client with correlation/language interceptors
- Initial auth page (`/login`)
- Initial operations vertical slice:
  - `/workorders`
  - `/workorders/[id]`
- Reusable UI primitives: `Button`, `Input`, `DataTable`, `Pagination`, `StatusBadge`

## Run
```bash
npm install
npm run dev
```

Set API base URL with:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
