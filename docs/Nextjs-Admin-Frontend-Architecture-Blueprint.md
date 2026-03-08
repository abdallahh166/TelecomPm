# TowerOps Next.js Admin Frontend Architecture Blueprint

## Step 1 — Backend Analysis

### 1) Main entities

Primary operational entities exposed by the API and domain are:
- Site
- Asset
- WorkOrder
- Visit
- Escalation
- Material
- Office
- User
- ChecklistTemplate
- DailyPlan
- KPI and Analytics projections
- Reports and DataExports projections

Supporting entities visible through workflows include visit checklist items, visit readings, visit photos, visit issues, signatures, and role/permission settings.

### 2) Business workflows

Core workflows inferred from API surface and domain lifecycle endpoints:
- Authentication and session lifecycle (login, refresh, logout, password reset, MFA).
- Site lifecycle (create/update/status/assignment/ownership/import).
- Asset lifecycle (create, service/fault/replace, history, expiring warranty and faulty monitoring).
- Work order lifecycle (create, assign, start, complete, submit for customer acceptance, accept/reject, close/cancel, signatures).
- Visit field lifecycle (create/start/check-in/check-out/complete/submit/review outcomes/cancel/reschedule/signature).
- Visit evidence and execution workflow (checklist items, issues, readings, photos, imported telemetry).
- Inventory/material workflow (catalog management + stock add/reserve/consume).
- Escalation workflow (create, review, approve/reject, close).
- Daily planning workflow (plan creation, assignment, unassignment, suggestion, publish).
- Governance workflows (users, roles, offices, settings).
- Reporting and analytics consumption workflows.

### 3) Analytics endpoints

Analytics and KPI endpoints:
- `GET /api/kpi/operations`
- `GET /api/analytics/engineer-performance/{engineerId}`
- `GET /api/analytics/site-maintenance/{siteId}`
- `GET /api/analytics/office-statistics/{officeId}`
- `GET /api/analytics/material-usage/{materialId}`
- `GET /api/analytics/visit-completion-trends`
- `GET /api/analytics/issue-analytics`

### 4) CRUD resources

Main CRUD-like resources:
- Sites: create/read/update plus status/assignment/ownership operations.
- Assets: create/read with state transition operations and history.
- WorkOrders: create/read with lifecycle mutations.
- Visits: create/read with execution and review mutations.
- Materials: full CRUD plus stock mutations.
- Users: full CRUD plus role/activation/account actions.
- Offices: full CRUD plus contact/statistics.
- Roles: CRUD + permission listing.
- Settings: list/read/update.
- ChecklistTemplates: list/read/create/activate/import.
- DailyPlans: create/read and assignment/publish operations.

### 5) Relationships between entities

High-level domain relationships:
- Office has many Sites, Users, Materials, and DailyPlans.
- Site has many Assets, WorkOrders, Visits, and maintenance analytics/report records.
- WorkOrder belongs to Site and often results in planned/executed Visits.
- Visit belongs to Site + WorkOrder and is performed by engineer Users.
- Visit owns execution artifacts: checklist items, readings, photos, issues, signatures.
- Escalation is linked to WorkOrder and/or Visit for exception handling.
- Roles/Permissions control access to all workflows.

### Domain summary

TowerOps is an operations platform for telecom field service management: it coordinates office-level planning, site maintenance, asset health, work-order execution, engineer visits, evidence capture, approvals, escalations, material usage, and customer-facing acceptance/reporting.

---

## Step 2 — Frontend Architecture (Next.js + modular features)

### Recommended navigation structure

Primary app sections in sidebar/top nav:
1. Dashboard
2. Operations
   - Sites
   - Assets
   - Work Orders
   - Visits
   - Daily Plans
   - Escalations
   - Materials
3. Analytics
4. Reports
5. Administration
   - Users
   - Offices
   - Roles
   - Settings

### App-level architecture

- Framework: Next.js App Router.
- Rendering strategy:
  - Server components for shell/layout and non-interactive data panels.
  - Client components for forms, tables, chart interactions, and mutations.
- State:
  - React Query for server-state caching/mutations.
  - React Hook Form + Zod/Yup for form state/validation.
  - Lightweight UI state in local component state or dedicated feature stores only when required.
- API access:
  - Axios client with interceptors for auth/correlation/localization.
  - Module-scoped service files and query hooks.

### Main modules and purpose

- `dashboard`: Operational overview, KPI cards, trend snapshots, recent activity.
- `sites`: Site directory, ownership/status updates, assignments, location and maintenance context.
- `assets`: Asset registry, fault/service/replace workflows, warranty and fault views.
- `visits`: End-to-end field execution and review lifecycle with evidence artifacts.
- `workorders`: Work order creation, assignment, lifecycle progression, customer acceptance.
- `analytics`: Deeper performance and trend analysis by engineer/site/office/material/issue.
- `reports`: Downloadable/printable operational reports (scorecards, checklist, BDT, data collection, visit report).
- `admin`: User/office/role/settings governance.

### Role-based experience model (explicit)

To cover **Engineer operations and other roles**, the frontend is split by role-focused workspaces while still sharing the same component/system foundation:

- **Admin**: full governance (users, roles, settings, office setup, cross-office visibility).
- **Operations Manager / Supervisor**: planning, assignment, review/approval, SLA and escalations.
- **Engineer (Field)**: assigned visits, check-in/check-out, checklist/readings/photos/issues/signature, submit completion.
- **Reviewer / QA**: pending review queue, approve/reject/request correction flows.
- **Inventory / Storekeeper**: materials catalog and stock operations (add/reserve/consume, low-stock control).
- **Client / Customer Portal User**: readonly operational transparency + accept/reject customer acceptance step.

### Engineer operations module (explicit)

Add a dedicated `engineer-ops` module to avoid hiding engineer workflows under generic visits pages:

- `my-day`: today schedule and task order.
- `my-visits`: assigned visit queue by status.
- `visit-execution`: start/check-in/check-out/complete/submit lifecycle actions.
- `evidence-capture`: checklist items, issues, readings, photos, signature.
- `sync-status` (optional for offline field): conflict and sync monitoring panels.

### Layout model

- `RootLayout`: app providers and global styles.
- `AuthLayout`: login/forgot/reset/mfa pages.
- `AppLayout`: authenticated shell with sidebar, top bar, breadcrumbs, and context actions.
- `ModuleLayout`s: module-specific tabs/filters/actions.

---

## Step 3 — Page map

### Dashboard
- Page: `/dashboard`
- Purpose: executive + operational snapshot.
- APIs: `/api/kpi/operations`, analytics trend endpoints.
- Components: KPI cards, trend charts, recent visits/workorders widget, alert panels.

### Sites
- Page: `/sites`
- Purpose: list/search/filter sites and trigger management actions.
- APIs: `GET /api/sites/office/{officeId}`, `GET /api/sites/maintenance`, `PATCH /api/sites/{siteId}/status`, assignment endpoints.
- Components: DataTable, Filters, SearchInput, StatusBadge, Pagination, bulk action toolbar.

- Page: `/sites/[siteId]`
- Purpose: site profile, assets/workorders/visits context.
- APIs: `GET /api/sites/{siteId}`, `GET /api/assets/site/{siteCode}`, site analytics endpoint.
- Components: summary cards, tabs, related tables, map/location panel.

- Page: `/sites/new` and `/sites/[siteId]/edit`
- Purpose: create/update site.
- APIs: `POST /api/sites`, `PUT /api/sites/{siteId}`.
- Components: RHF form sections, validation summary, submit/cancel actions.

### Assets
- Page: `/assets`
- Purpose: monitor and manage assets.
- APIs: site-scoped and quality views such as `GET /api/assets/faulty`, `GET /api/assets/expiring-warranties`.
- Components: DataTable, quick filters, status badges, pagination.

- Page: `/assets/[assetCode]`
- Purpose: asset profile and history.
- APIs: `GET /api/assets/{assetCode}`, `GET /api/assets/{assetCode}/history`.
- Components: detail cards, timeline, action drawer.

- Page: `/assets/[assetCode]/actions`
- Purpose: service/fault/replace mutations.
- APIs: `PUT /api/assets/{assetCode}/service|fault|replace`.
- Components: action forms, confirmation modal, audit trail preview.

### Work Orders
- Page: `/workorders`
- Purpose: list and track work orders by status/SLA.
- APIs: `GET /api/portal/workorders` (for customer view if needed), plus internal read endpoints.
- Components: DataTable, priority/status filters, SLA indicators.

- Page: `/workorders/[id]`
- Purpose: lifecycle control and linked visits.
- APIs: `GET /api/workorders/{workOrderId}`, lifecycle patch endpoints, signature endpoints.
- Components: header summary, lifecycle stepper, assignment panel, linked visits table.

- Page: `/workorders/new`
- Purpose: create work order.
- APIs: `POST /api/workorders`.
- Components: form wizard, site lookup, checklist template selector.

### Visits
- Page: `/visits`
- Purpose: operational queue for scheduled/pending review visits.
- APIs: `GET /api/visits/scheduled`, `GET /api/visits/pending-reviews`.
- Components: segmented tabs, tables, review queue counters.

- Page: `/visits/[visitId]`
- Purpose: full visit execution and review details.
- APIs: `GET /api/visits/{visitId}`, evidence/signature APIs, checklist/issues/readings/photo endpoints.
- Components: lifecycle timeline, checklist grid, evidence gallery, notes/review panel.

- Page: `/visits/new` and `/visits/[visitId]/edit`
- Purpose: create/reschedule/cancel visit.
- APIs: `POST /api/visits`, cancel/reschedule endpoints.
- Components: scheduling form, engineer assignment, conflict hints.

### Analytics
- Page: `/analytics`
- Purpose: central analytics cockpit.
- APIs: all `/api/analytics/*`, `/api/kpi/operations`.
- Components: DateRangePicker, charts, comparison cards, filters panel.

- Page: `/analytics/engineers/[engineerId]`
- Purpose: engineer performance deep dive.
- APIs: `GET /api/analytics/engineer-performance/{engineerId}`.
- Components: KPI strip, trend charts, distribution charts.

### Reports
- Page: `/reports`
- Purpose: report catalog and generation controls.
- APIs: reports endpoints and data export endpoints.
- Components: report cards, filter form, download center, export status list.

### Administration
- Pages: `/admin/users`, `/admin/users/[userId]`, `/admin/users/new`
- APIs: users CRUD + role/activate/deactivate/unlock.
- Components: user table, user profile, form dialogs.

- Pages: `/admin/offices`, `/admin/offices/[officeId]`
- APIs: offices CRUD + statistics.
- Components: office table, contact form, office stats widgets.

- Pages: `/admin/roles`, `/admin/settings`
- APIs: roles/settings endpoints.
- Components: permission matrix, key-value settings table/editor.

### Engineer workspace pages (role-scoped)
- Page: `/engineer/my-day`
- Purpose: engineer daily execution board with assigned visits and ordering.
- APIs: `GET /api/visits/engineers/{engineerId}`, `GET /api/visits/scheduled`, `GET /api/daily-plans/{officeId}/{date}`.
- Components: DayTimeline, VisitQueueCard, AssignmentList, quick lifecycle action buttons.

- Page: `/engineer/visits/[visitId]/execute`
- Purpose: guided execution workflow for field engineer (mobile-friendly).
- APIs: `POST /api/visits/{visitId}/start`, `POST /api/visits/{visitId}/checkin`, `POST /api/visits/{visitId}/checkout`, `POST /api/visits/{visitId}/complete`, `POST /api/visits/{visitId}/submit`.
- Components: lifecycle stepper, geostamp/status panel, sticky action footer.

- Page: `/engineer/visits/[visitId]/evidence`
- Purpose: collect and manage evidence before submit.
- APIs: checklist/issues/readings/photos/signature endpoints under `/api/visits/{visitId}/*`.
- Components: ChecklistEditor, ReadingsForm, IssueTracker, PhotoUploader, SignaturePad.

### Reviewer/QA pages (role-scoped)
- Page: `/reviews/visits`
- Purpose: process submitted visits and enforce quality controls.
- APIs: `GET /api/visits/pending-reviews`, approve/reject/request-correction endpoints.
- Components: review queue table, evidence preview drawer, decision modal with notes.

### Inventory/Storekeeper pages (role-scoped)
- Page: `/inventory/materials`
- Purpose: stock monitoring and transactions.
- APIs: `GET /api/materials`, `GET /api/materials/low-stock/{officeId}`, stock add/reserve/consume endpoints.
- Components: stock table, low-stock alerts, transaction modal, movement history table.

### Client portal pages (role-scoped)
- Page: `/portal/dashboard`
- Purpose: client-facing operational transparency dashboard.
- APIs: `GET /api/portal/dashboard`, `GET /api/portal/sla-report`.
- Components: SLA cards, site summary widgets, recent workorder timeline.

- Page: `/portal/workorders`
- Purpose: customer acceptance actions on completed work orders.
- APIs: `GET /api/portal/workorders`, `PATCH /api/portal/workorders/{id}/accept`, `PATCH /api/portal/workorders/{id}/reject`.
- Components: workorder table, acceptance decision modal, evidence linkouts.

---

## Step 4 — Scalable folder structure

```text
frontend/towerops-next/
  src/
    app/
      (auth)/
      (dashboard)/
      (operations)/
      (analytics)/
      (reports)/
      (admin)/
      layout.tsx
      page.tsx
    modules/
      dashboard/
      sites/
      assets/
      visits/
      workorders/
      analytics/
      reports/
      admin/
    components/
      ui/
      data-display/
      forms/
      charts/
      feedback/
    services/
      api-client.ts
      auth.service.ts
      sites.service.ts
      assets.service.ts
      visits.service.ts
      workorders.service.ts
      analytics.service.ts
      reports.service.ts
      admin.service.ts
    hooks/
      queries/
      mutations/
      usePagination.ts
      useFilters.ts
    types/
      api.ts
      common.ts
      sites.ts
      assets.ts
      visits.ts
      workorders.ts
      analytics.ts
      admin.ts
    lib/
      query-client.ts
      axios-interceptors.ts
      validators/
      constants/
    layouts/
      app-layout/
      auth-layout/
      module-layouts/
    utils/
      date.ts
      format.ts
      permissions.ts
      errors.ts
```

### Role-based route groups (recommended)

Use route groups in App Router to separate role experiences cleanly:

- `app/(admin)/*` for Admin governance pages.
- `app/(operations)/*` for managers/supervisors.
- `app/(engineer)/*` for field engineer workflows.
- `app/(review)/*` for QA/review operations.
- `app/(inventory)/*` for materials/stock roles.
- `app/(portal)/*` for client-facing experience.

Purpose by folder:
- `app`: route segments, layouts, route-level loading/error boundaries.
- `modules`: feature-owned components, hooks, schemas, local state.
- `components`: cross-feature reusable UI.
- `services`: API boundary and endpoint abstractions.
- `hooks`: shared query/mutation behavior.
- `types`: strongly typed contracts.
- `lib`: infrastructure wiring (query/axios/validators/constants).
- `layouts`: reusable shell structures.
- `utils`: pure helpers.

---

## Step 5 — API service layer design

### Principles
- One central Axios client instance.
- Module-separated service files.
- Fully typed request/response DTOs.
- React Query hooks consume service functions.
- Unified error mapper for backend contract.

### Service layout
- `services/api-client.ts`
  - baseURL from env
  - interceptors: bearer token, correlation ID, language, 401-refresh
- `services/{module}.service.ts`
  - only endpoint-specific functions
- `types/*`
  - DTO types for params/payloads/results
- `hooks/queries/*` and `hooks/mutations/*`
  - `useQuery`/`useMutation` wrappers with typed keys

### Error handling
- Parse backend error shape `{code,message,correlationId,errors,meta}` into `AppApiError`.
- Global boundary + toast notifications for recoverable failures.
- Form-level field error binding from `errors` dictionary.
- Retry policy disabled for non-idempotent mutations; tuned for GET.

---

## Step 6 — Reusable components and usage

- `DataTable`: used in sites/assets/visits/workorders/users/offices/roles/settings lists.
- `Filters`: any list page requiring status/date/office/priority filters.
- `SearchInput`: global search on operational entities.
- `Pagination`: all paged list endpoints.
- `StatusBadge`: lifecycle statuses (visit/workorder/asset/site/user).
- `DateRangePicker`: dashboard/analytics/reports filtering.
- `FileUpload`: imports (sites data, checklist templates, visit evidence).
- `KpiCard`: dashboard and analytics summary strips.
- `LineChart/BarChart/PieChart` wrappers (Recharts): dashboard + analytics pages.
- `EntityHeader`: details pages with actions.
- `DetailTabs`: split details into overview/activity/evidence/history.
- `ConfirmDialog`: destructive or irreversible transitions.
- `EmptyState`, `ErrorState`, `LoadingSkeleton`: shared UX states.

---

## Step 7 — Dashboard layout design

Layout sections:
1. Top filter row
   - office selector, date range, refresh button.
2. KPI strip
   - open work orders, visits today, completion rate, SLA compliance, escalations open.
3. Primary charts row
   - visit completion trend (line)
   - work order status distribution (bar/pie)
4. Secondary insights row
   - engineer performance leaderboard
   - issue category analytics
5. Recent activity panels
   - latest work orders
   - pending visit reviews
   - recent escalations
6. Alert rail
   - low stock, expiring warranties, SLA risks.

All widgets should be independently query-driven and resilient to partial failure.

---

## Step 8 — CRUD page design for core resources

### Sites
- List: filterable/paginated table with status, office, ownership and quick actions.
- Details: site profile + related assets/workorders/visits + maintenance indicators.
- Create/Edit: structured form sections (identity, location, ownership, assignment).
- APIs: site CRUD + status/assignment/ownership + related fetches.

### Assets
- List: asset table with fault/warranty flags and filter presets.
- Details: asset metadata + lifecycle history timeline.
- Create/Edit/actions: asset create + service/fault/replace action forms.
- APIs: assets read/create/actions/history/faulty/expiring.

### Visits
- List: scheduled and pending review queues with smart tabs.
- Details: lifecycle + evidence + checklist + issues + readings + signature + review controls.
- Create/Edit: planning form (site/workorder/engineer/date/type).
- APIs: visits core + lifecycle endpoints + evidence/checklist/issues/readings endpoints.

### WorkOrders
- List: status/SLA view with assignment and priority visibility.
- Details: lifecycle stepper, customer acceptance state, linked visits, signature.
- Create/Edit: creation form and assignment flow.
- APIs: workorder create/get + lifecycle and signature endpoints.

---

## Step 9 — UX and state handling patterns

- Loading states:
  - route-level skeletons via Next.js loading.tsx
  - component-level skeleton blocks for cards/tables/charts.
- Error states:
  - route error boundaries + reusable `ErrorState` with retry action.
  - inline form errors and banner for mutation failures.
- Empty states:
  - contextual message + clear CTA (e.g., “Create first work order”).
- Filtering/sorting/pagination:
  - URL-synced query params for shareable views.
  - centralized query param parser/serializer.
- Form validation:
  - React Hook Form + schema validation, field-level messages, submit-level summary.
- Optimistic updates:
  - enable selectively for low-risk actions (status toggles), otherwise invalidate and refetch.
- Access control UX:
  - disable/hide actions based on permission claims.

---

## Step 10 — Implementation plan

1. **Project setup**
   - initialize Next.js + TypeScript + Tailwind + ESLint + Prettier.
   - install Axios, React Query, React Hook Form, Recharts.
2. **Base layout**
   - implement auth/app layouts, navigation shell, route groups, guard middleware.
3. **API client**
   - build typed Axios client, auth handling, error adapter, query client defaults.
4. **Reusable components**
   - build design-system primitives and data components (table/filter/pagination/badges/cards/charts).
5. **Module pages**
   - implement sites/assets/visits/workorders flows first, then admin modules.
6. **Analytics dashboards**
   - add KPI and analytics pages with chart composition and date/filter controls.
7. **UX improvements**
   - polish loading/error/empty states, permissions UX, accessibility, performance, and test coverage.


---

## Step 11 — Enterprise readiness checklist (what is still missing)

The current blueprint is strong on module architecture and workflows, but an enterprise rollout also needs explicit non-functional and governance controls.

### A) Security and identity hardening
- SSO federation (OIDC/SAML) for enterprise tenants in addition to JWT login.
- Strong session controls (idle timeout, absolute timeout, concurrent session policy).
- Device/session management page (active sessions + revoke).
- CSP, strict security headers, and dependency vulnerability gates in CI.
- Secret rotation runbook (API keys, signing keys, and environment variables).

### B) Compliance and auditability
- Immutable frontend audit trail for privileged actions (who/what/when/from where).
- PII data-classification matrix and masking strategy on UI level.
- Data retention and legal-hold UX for export/delete flows.
- Accessibility compliance target and evidence (WCAG 2.1 AA test report).

### C) Observability and operability
- Frontend telemetry standards: structured logs, tracing IDs, and key user-journey events.
- Real-user monitoring (web vitals, error rates, interaction latency).
- SLOs/SLIs for critical journeys (login, work order transitions, visit submit/review).
- Runbook for incident response and feature kill-switch configuration.

### D) Quality engineering at scale
- Required automated gates:
  - unit tests (components/hooks/services)
  - API contract tests against OpenAPI mocks
  - e2e tests for role-critical workflows (Admin/Engineer/Reviewer/Portal)
  - visual regression tests for dashboard and critical forms
- Performance budgets enforced in CI (bundle size, LCP, INP, CLS).
- Browser/device support matrix with automated smoke checks.

### E) Delivery, environments, and release strategy
- Multi-environment strategy (dev/stage/prod) with environment parity checks.
- Deployment model with canary/blue-green and automated rollback.
- Feature flags with governance (owner, expiry, cleanup policy).
- Semantic versioning and release notes automation.

### F) Multi-tenancy and scalability
- Tenant/office isolation strategy at UI routing + data scopes.
- Large-list performance controls (virtualization, server pagination, lazy loading).
- Caching strategy per data sensitivity and staleness profile.
- Resilience for partial backend failures (widget-level fallbacks and degraded mode).

### G) Product governance and maintainability
- Architecture Decision Records (ADR) process for major frontend decisions.
- Frontend ownership map by module and codeowners.
- Definition of Done including security/accessibility/performance/test gates.
- Backlog for tech debt and component-library lifecycle management.

### Enterprise implementation wave (recommended)
1. **Wave 1 — Security + SSO + auditability foundations**.
2. **Wave 2 — Observability + SLOs + incident readiness**.
3. **Wave 3 — Full quality gates (contract, e2e, visual, performance budgets)**.
4. **Wave 4 — Release engineering maturity (canary, rollback, flag governance)**.
5. **Wave 5 — Compliance certification and operational hardening sign-off**.



---

## Step 12 — Visual design system, branding, themes, and localization

### A) Brand and logo system
- Define a formal brand package for frontend implementation:
  - primary logo (horizontal wordmark)
  - compact logo mark (icon-only)
  - monochrome variants for dark/light backgrounds
  - minimum size, clear-space, and misuse rules
- Store brand assets in a single source path (e.g. `public/brand/*`) with versioned filenames.
- Add a `BrandHeader` component to enforce consistent logo usage in auth pages, app shell, PDF/report headers, and portal.
- Include a fallback strategy when logo assets fail to load (text brand mark + accessible label).

### B) Design tokens and component styling governance
- Create token layers:
  - **primitive tokens**: base colors, spacing, typography scale, radii, shadows
  - **semantic tokens**: `bg.surface`, `text.primary`, `status.success`, `status.warning`
  - **component tokens**: table row heights, button variants, form control states
- Bind Tailwind config to token variables to avoid hardcoded colors in components.
- Define status color mapping for domain states (work order, visit, asset, escalation) and keep it centralized.
- Provide component states for hover/focus/active/disabled/loading and ensure WCAG contrast.

### C) Light and dark themes (including role context)
- Support both themes through CSS variables + Tailwind class strategy (`class='dark'`).
- Theme rules:
  - internal operations workspace defaults to dark (optional user override)
  - portal/client workspace defaults to light (optional user override)
- Persist user theme preference per account and device, with server-side profile sync when possible.
- Include theme-aware chart palettes for Recharts to preserve readability in both themes.
- Add no-flash theme hydration pattern in Next.js (`<script>` before paint to set initial theme).

### D) Localization and internationalization (i18n)
- Target locales at minimum: `en-US` and `ar-EG`.
- Implement locale-aware routing (`/[locale]/...`) or middleware-driven locale context in App Router.
- Externalize all user-facing strings (no hardcoded text in components).
- Support locale-specific formatting:
  - dates/times (UTC display policy + local presentation)
  - numbers/percentages/currency
  - pluralization rules
- Keep API error code mapping localized through translation keys.

### E) RTL support (Arabic)
- Apply `dir='rtl'` automatically for Arabic and keep layout mirrored where appropriate.
- Ensure shared components are bi-directional-safe (tables, breadcrumbs, icons, pagination, charts labels).
- Validate mixed LTR/RTL content rendering (codes, emails, IDs, phone numbers).
- Use visual regression snapshots for both `en-US` and `ar-EG` in light/dark combinations.

### F) Accessibility and UX consistency for themes/locales
- Keyboard navigation and visible focus rings in both light and dark modes.
- Color is never the only indicator for status; add icons/text labels.
- Verify contrast ratios and text legibility for charts, badges, and alert panels.
- Provide language switcher and theme switcher in a predictable global location (top bar/user menu).

### G) Enterprise acceptance criteria for design/theming/localization
- Brand consistency:
  - 100% of app shells and auth screens use approved logo components.
- Theme quality:
  - zero major contrast failures in dark/light audits.
- Localization quality:
  - zero hardcoded strings in production bundles.
  - full navigation + core workflows validated in `en-US` and `ar-EG`.
- RTL quality:
  - no blocking layout regressions in engineer, operations, admin, and portal primary paths.

### Implementation add-on sequence (after Step 10)
1. Introduce tokens + logo asset package + base typography.
2. Implement theme infrastructure and theme-aware chart styling.
3. Integrate i18n pipeline and locale routing strategy.
4. Apply RTL hardening and run visual/accessibility regression checks.
5. Finalize brand QA and localization sign-off checklist.
