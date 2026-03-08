# TowerOps Frontend Architecture Plan

## Purpose
This document defines the frontend architecture for the TowerOps web application, aligned with **TowerOps-Frontend-Implementation-Phases.md**. Implementation follows phases 0→8 sequentially; no phases are skipped and API contracts are not changed.

## Current Implementation Snapshot (March 6, 2026)

Implemented in code (`frontend/towerops-web`):
- Auth flow routes and pages: `/login`, `/forgot-password`, `/reset-password`, `/change-password`.
- Protected routing with `RequireAuth` and permission gating via `RequireAnyPermission`.
- Authenticated shell with permission-aware navigation tabs (Dashboard/Admin/Operations).
- API client with correlation header propagation, Accept-Language, bearer token injection, and one-time refresh retry on 401.
- Unified API error adapter and pagination parser utilities.
- Workspace routing:
  - Admin: `/admin/offices`, `/admin/users`, `/admin/roles`, `/admin/settings`.
  - Operations: `/operations/sites`, `/operations/assets`, `/operations/materials`, `/operations/visits`, `/operations/visits/:visitId`, `/operations/work-orders`, `/operations/escalations`, `/operations/daily-plans`.

Pending for later phases:
- Dedicated reporting and analytics UI module scope (Phase 6).
- Dedicated client portal and sync monitoring UI module scope (Phase 7).
- Full hardening and UAT gate items (Phase 8).

Verification status:
- `npm run lint` passed on March 6, 2026.
- `npm run build` passed on March 6, 2026.

---

## 1. Technology Stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Runtime | React 19 | StrictMode, concurrent features |
| Language | TypeScript | Strict mode, no implicit any |
| Build | Vite | ESM, fast HMR |
| Styling | TailwindCSS | Utility-first, design tokens from brand |
| Routing | React Router 7 | Data APIs, nested routes |
| Data / Server state | TanStack React Query | Caching, retries, 401 handling |
| HTTP client | Axios | Interceptors for auth + correlation ID |
| i18n | Key-based translations | en-US, ar-EG; RTL for Arabic |

---

## 2. Folder Structure (Feature-Based)

```
src/
├── app/                    # Application bootstrap and shell
│   ├── layouts/            # Root layout components
│   ├── router.tsx          # Route definitions and guards
│   └── providers.tsx       # QueryClient, Router, Auth, i18n, Error
├── layouts/                # Reusable layout wrappers
│   ├── AppShell.tsx        # Authenticated shell (header, nav, main)
│   └── PublicLayout.tsx    # Unauthenticated (centered, e.g. login)
├── features/               # Feature modules (one folder per feature)
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── types/
│   ├── admin/              # Phase 2
│   ├── operations/          # Phases 3–5
│   ├── reporting/          # Phase 6
│   └── portal/             # Phase 7
├── components/             # Shared UI (design system)
│   ├── Button/
│   ├── Input/
│   ├── Select/
│   ├── DataGrid/
│   ├── Modal/
│   ├── Toast/
│   └── StatCard/
├── services/               # Cross-cutting API and adapters
│   ├── api/                # Axios instance, interceptors
│   ├── errorAdapter.ts     # Unified API error → UI
│   └── paginationAdapter.ts# Normalize paginated responses
├── hooks/                  # Shared hooks (e.g. useAuth from context)
├── types/                  # Shared TS types (API contracts, pagination)
├── utils/                  # Pure helpers (correlation ID, etc.)
└── i18n/                   # Locales and RTL
    ├── en-US.json
    ├── ar-EG.json
    └── index.ts
```

Each **feature** contains:
- **pages**: Route-level components
- **components**: Feature-specific UI
- **api**: API service functions (calling `services/api`)
- **hooks**: Feature-specific hooks (e.g. useLogin)
- **types**: Feature-specific types

---

## 3. API Client and Adapters

### 3.1 Base URL and Correlation
- Base URL: `import.meta.env.VITE_API_BASE_URL` (default `/api` when proxied).
- **Every** request: add header `X-Correlation-ID` (UUID or fallback). Response correlation ID used in error context.

### 3.2 Auth and Refresh
- **Access token**: Stored in memory only (React state/context). No localStorage for access token.
- **Refresh token**: Stored in memory or sessionStorage only (per security requirements: “memory or session only”).
- **Axios request interceptor**: Attach `Authorization: Bearer <accessToken>` when token exists; skip for anonymous routes (e.g. login, refresh, forgot-password).
- **Axios response interceptor**: On 401, attempt **single** refresh (POST /api/auth/refresh with refresh token); on success retry original request with new access token; on failure call auth failure handler (logout, redirect to login). **No infinite retry loop**: one retry per 401.

### 3.3 Error Adapter
- Backend contract: `{ code, message, correlationId?, errors?, meta? }`.
- Adapter: normalize 4xx/5xx responses into a single **ApiError** type; expose to UI via global error handler (e.g. Toast or ErrorBanner). All 4xx/5xx go through this unified error UI.

### 3.4 Pagination Adapter
- Backend list responses: `{ data: T[], pagination: { page, pageSize, total, totalPages, hasNextPage, hasPreviousPage } }`.
- Adapter: parse and type `pagination`; handle endpoints that use `pageNumber`/`pageSize` (e.g. engineer visits) vs `page`/`pageSize` (e.g. pending reviews) per Api-Doc and Pagination-Consistency-Matrix. No contract change; only client-side normalization.

---

## 4. Auth Routing

- **Public routes**: `/login`, `/forgot-password`, `/reset-password` (and reset link with token), optional MFA setup/verify.
- **Protected routes**: All other routes require authenticated user. If not authenticated, redirect to `/login` with `from` in state.
- **Guards**: Optional role/permission guards in later phases; Phase 1 only “authenticated vs anonymous”.

---

## 5. Brand and Theme

- **Fonts**: Barlow (primary), Barlow Condensed (headings/wordmark), JetBrains Mono (labels, tags), Cairo (Arabic).
- **Colors**: Navy #0A1628, Blue #00C2FF, Orange #FF6B00, Green #00E896, Amber #FFB800, Red #FF4444.
- **Internal ops**: Dark theme (--d-bg, --d-surface, --d-text, etc.).
- **Client portal** (Phase 7): Light theme (--l-bg, --l-surface, etc.).
- Tailwind: extend theme with these tokens; use for all components.

---

## 6. i18n and RTL

- **Locales**: en-US (default), ar-EG.
- **Storage**: Persist language preference (e.g. localStorage key `towerops.lang`).
- **Arabic**: Set `dir="rtl"` on `<html>` when locale is ar-EG.
- **Strings**: Key-based only (e.g. `t('auth.login.title')`); no hardcoded user-facing copy in components.

---

## 7. Phase 1 Scope (Foundations and API Client)

- **App shell**: Branded header (TowerOps wordmark, tagline), user pill, logout. Dark theme.
- **Auth routing**: Public (login, forgot-password, reset-password) and protected (default redirect to home).
- **API client**: Axios instance with base URL; request interceptor (X-Correlation-ID, Accept-Language, Bearer); response interceptor (401 → single refresh, then retry or logout).
- **Error adapter**: Normalize backend error body to ApiError; global error UI for all failed requests (except suppressed e.g. refresh).
- **Pagination adapter**: Type and normalize `{ data, pagination }` for list endpoints.
- **Login page**: Email, password, optional MFA code; call POST /api/auth/login; redirect on success.
- **Optional MFA**: Links or flow to MFA setup (POST /api/auth/mfa/setup) and verify (POST /api/auth/mfa/verify).
- **Forgot password**: Page/form calling POST /api/auth/forgot-password.
- **Reset password**: Page with token (query or path) calling POST /api/auth/reset-password.
- **Change password**: Post-login flow calling POST /api/auth/change-password (optional in Phase 1; can be simple protected page).

Required APIs used in Phase 1:
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/change-password
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/mfa/setup, POST /api/auth/mfa/verify (optional MFA)

---

## 8. Security Checklist (Phase 1)

- [ ] Access token in memory only (no localStorage).
- [ ] Refresh token in memory or sessionStorage only.
- [ ] Single retry on 401 (refresh then retry or logout).
- [ ] No infinite refresh loop (guard with “already refreshing” flag).
- [ ] X-Correlation-ID on 100% of API requests.
- [ ] Unified error UI for 4xx/5xx.

---

## 9. Subsequent Phases (Summary)

- **Phase 2**: Admin workspace (offices, users, roles, settings); list pagination and sort allowlists.
- **Phase 3**: Sites, assets, materials; imports and file constraints.
- **Phase 4**: Visit lifecycle; engineer queue (pageNumber/pageSize) and pending/scheduled (page/pageSize); review actions.
- **Phase 5**: Work orders, escalations, daily plans.
- **Phase 6**: KPI dashboard, analytics, exports.
- **Phase 7**: Client portal (light theme), sync monitoring.
- **Phase 8**: WCAG, performance, E2E, release.

---

## 10. References

- `docs/TowerOps-Frontend-Implementation-Phases.md` — phase definitions and acceptance
- `docs/Api-Doc.md` — API endpoints and contracts
- `docs/Pagination-Consistency-Matrix.md` — pagination per endpoint
- `docs/TowerOps-Brand-Profile.md` — brand and design tokens
