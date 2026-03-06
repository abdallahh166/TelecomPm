# TowerOps Frontend Implementation Phases

## Purpose
This document defines the phased rollout plan for the **TowerOps** web frontend. It aligns branding, backend API contracts, UX deliverables, governance controls, and release gates into an executable delivery model.

## Source Documents
- `docs/TowerOps-Brand-Profile.md`
- `docs/Frontend-Reporting-API-Contract-and-Git-Plan.md`
- `docs/Api-Doc.md`
- `docs/Pagination-Consistency-Matrix.md`
- `docs/File-Constraints-Matrix.md`
- `docs/Documentation-Index.md`
- `docs/ops/Incident-Runbook-Sync-Conflict-Replay.md`
- `docs/branding/towerops-branding-complete.html` (brand identity source)

## Current Implementation Status (March 6, 2026)

| Phase | Status in current frontend code | Notes |
|---|---|---|
| 0 | Documented | Governance model is documented; enforcement depends on branch protection and CI configuration. |
| 1 | Implemented | Auth pages, protected shell, token refresh flow, error/correlation handling are implemented. |
| 2 | Implemented | Admin workspace routes and pages exist for Offices, Users, Roles, Settings. |
| 3 | Implemented | Operations pages exist for Sites, Assets, Materials, including import and stock operations. |
| 4 | Partially implemented | Visits list and visit detail review actions exist; full evidence capture UX is not fully complete. |
| 5 | Partially implemented | Work-order lifecycle UI exists; dedicated escalations and daily-plans pages are not wired yet. |
| 6 | Partially implemented | KPI dashboard is implemented; dedicated analytics/reporting pages are pending. |
| 7 | Not implemented | Portal and sync monitoring routes/pages are not wired yet. |
| 8 | Not complete | Baseline quality checks pass, but full hardening/UAT gates are still pending. |

Implemented route coverage:
- `/` dashboard
- `/login`, `/forgot-password`, `/reset-password`, `/change-password`
- `/admin/offices`, `/admin/users`, `/admin/roles`, `/admin/settings`
- `/operations/sites`, `/operations/assets`, `/operations/materials`, `/operations/visits`, `/operations/visits/:visitId`, `/operations/work-orders`

Verification:
- `npm run lint` and `npm run build` pass in `frontend/towerops-web` (March 6, 2026).

---

## Brand Context
| Item | Value |
|---|---|
| Product name | TowerOps |
| Company | Seven Pictures |
| Tagline | TowerOps - PM/CM Operations Control for Telecom Subcontractors |
| Product type | Telecom field-operations platform for subcontractors |

Target users:
- Admin (Phases 1-2)
- Office Manager / Supervisor (Phases 2-6)
- Field Engineer (Phases 4-5, 7)
- Client portal users (Phase 7)

UI brand rules:
- Use `TowerOps` in all user-facing headers and app shell.
- Keep tone operational and professional.
- Keep role boundaries explicit (Admin/Manager/Engineer/Portal).

### Brand Identity Baseline (from `towerops-branding-complete.html`)
Typography:
- Primary UI font: `Barlow`.
- Display/headline font: `Barlow Condensed` (high-impact headings and wordmark).
- Technical/label font: `JetBrains Mono` (small labels, status tags, token-like metadata).
- Arabic font: `Cairo` (Arabic copy and RTL surfaces).

Color system:
- Core brand:
  - `--navy: #0A1628`
  - `--blue: #00C2FF`
  - `--orange: #FF6B00`
  - `--green: #00E896`
  - `--amber: #FFB800`
  - `--red: #FF4444`
- Ops dark theme (default):
  - `--d-bg: #0A1628`, `--d-surface: #0F1E35`, `--d-surface2: #152640`
  - `--d-border: #1E3A5F`, `--d-text: #E8F4FF`, `--d-muted: #6B8BAE`
- Portal light theme:
  - `--l-bg: #F4F7FB`, `--l-surface: #FFFFFF`, `--l-surface2: #EEF3F9`
  - `--l-border: #D0DCE9`, `--l-text: #0A1628`, `--l-muted: #5A7A9A`

Theme usage policy:
- Internal operations workspace uses the dark token set by default.
- Client portal may use the light token set.
- Alert semantics must stay consistent across themes:
  - success `green`, warning `amber`, critical `red`, info/action `blue`.

---

## Phase Overview
| Phase | Name | Outcome |
|---|---|---|
| 0 | Delivery governance | Owners, cadence, branch/PR policy, DoD, risks |
| 1 | Foundations and API client | Auth, shell, error handling, API adapter |
| 2 | Master data and admin workspace | Offices, users, roles, settings |
| 3 | Site and material operations | Sites, assets, materials, imports |
| 4 | Visit lifecycle workspace | Visits, evidence, review flow |
| 5 | Work orders, escalations, daily planning | WO board, escalations, daily plans |
| 6 | Reporting and analytics | KPI dashboard, analytics, exports |
| 7 | Client portal and sync monitoring | Portal shell, sync/conflict views |
| 8 | Hardening, accessibility, UAT | WCAG, performance, E2E, release |

---

## Phase 0 - Delivery Governance
Goal: lock delivery controls before implementation.

Deliverables:
- Owners matrix (Tech Lead, Product, QA, Security, DevOps).
- Sprint cadence/capacity and target dates.
- Branch strategy: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- PR template and branch protection enforcement.
- Shared Definition of Done.
- Release cadence and tagging strategy.

Acceptance:
- Owners matrix approved.
- PR template and branch protections active.
- Sprint plan and release cadence documented.
- DoD approved by Engineering + QA + Product.

---

## Governance and Standards (Cross-Phase)

### API Freeze Policy
- Contract lock is required before each phase starts.
- Non-breaking changes: min 1 sprint notice.
- Breaking changes: formal change request + migration plan + min 2 sprint notice (or API versioning).
- Every change must update `docs/Api-Doc.md` and related contract docs.

### Environment Matrix
| Item | Development | Staging | Production |
|---|---|---|---|
| Frontend URL | localhost | staging URL | production URL |
| API base URL | local/proxy | staging API | production API |
| Auth config | dev config | staging config | production config |
| Secrets | `.env` gitignored | env secrets | env secrets/vault |
| Feature flags | development flags | staged rollout flags | kill-switch only |
| CORS | localhost origins | explicit staging origins | explicit production origins |

### Frontend Observability
- Sentry/AppInsights integration for FE errors.
- Capture `X-Correlation-ID` in error context.
- Track web vitals (LCP/INP/CLS).
- Alert thresholds:
  - FE error rate > 2% over 15 min
  - Login failure rate > 5% over 15 min
  - Dashboard LCP p95 > 3s

### Security Standards
- Access token: memory/session scope only.
- Refresh flow: single retry on 401, no infinite loops.
- CSP and output encoding to reduce XSS risk.
- CI dependency scanning with SLA:
  - Critical: fix <= 24h
  - High: fix <= 7 days
  - Medium: fix <= 30 days
- PII redaction in telemetry payloads.

### i18n (ar/en) and RTL
- Support `en-US` and `ar-EG`.
- Arabic mode enables `dir="rtl"`.
- Persist language preference.
- Use key-based translation, no hardcoded user-facing strings.

### Design System Track
- Shared components: Button, Input, Select, DataGrid, Modal, Toast, StatCard.
- Shared tokens: typography, spacing, color, borders.
- Table/chart UX standards and accessibility baseline.

---

## Phase 1 - Foundations and API Client
Goal: establish stable integration base.

Key deliverables:
- Branded app shell.
- Auth routing (public/protected).
- API client with auth + correlation ID.
- Unified error adapter and pagination adapter.
- Login + optional MFA/forgot/reset path.

Required APIs:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Measurable acceptance:
- Login success rate >= 99% for valid credentials (staging sample set).
- Correlation ID included in 100% of API requests.
- Unified error UI used for all 4xx/5xx.

---

## Phase 2 - Master Data and Admin Workspace
Goal: deliver admin operations.

Scope:
- Offices CRUD and statistics.
- Users CRUD + role + activate/deactivate/unlock.
- Roles list/detail/permissions.
- Settings list/by-group/upsert/test.

Acceptance:
- All list pages use server pagination and documented sort allowlists.
- Admin actions match authorization policies.

---

## Phase 3 - Site and Material Operations
Goal: enable supervisor operational control.

Scope:
- Site management and imports.
- Asset inventory/actions.
- Materials list and stock operations.

Acceptance:
- Import flow shows imported/skipped/errors clearly.
- File constraints enforced per `docs/File-Constraints-Matrix.md`.

---

## Phase 4 - Visit Lifecycle Workspace
Goal: execute engineer and reviewer lifecycle.

Scope:
- Engineer queue and visit detail workspace.
- Evidence, checklist, readings, photos, signature.
- Review actions (approve/reject/request correction).

Important API note:
- Engineer queue uses `pageNumber,pageSize` on `GET /api/visits/engineers/{engineerId}`.
- Pending reviews and scheduled visits use `page,pageSize`.

Acceptance:
- End-to-end visit flow works (start -> submit).
- Review flow works with reviewer notes.
- Evidence constraints and pending state are visible.

Gate 4->5:
- No P0/P1 open in visit/review flows.
- WorkOrder/DailyPlan contract locked.

---

## Phase 5 - Work Orders, Escalations, Daily Planning
Goal: close dispatch and SLA operations.

Scope:
- Work order board/detail/lifecycle.
- Escalation lifecycle.
- Daily plan assignment/suggestions/publish.

Acceptance:
- WO lifecycle actions and customer accept/reject path validated.
- Escalation transitions and daily planning flows validated.

---

## Phase 6 - Reporting and Analytics
Goal: deliver management command center.

Scope:
- KPI dashboard.
- Analytics pages.
- Report exports (Excel/JSON).

Measurable acceptance:
- KPI dashboard p95 render < 2.5s in staging baseline dataset.
- Exports return correct content type and filename.
- All analytics filters apply correctly.

---

## Phase 7 - Client Portal and Sync Monitoring
Goal: deliver client-facing and sync observability surfaces.

Scope:
- Portal dashboard/sites/workorders/SLA/visits/evidence.
- Sync status and conflict monitoring for ops.

Offline UX strategy:
- Show queue state (pending, processed, failed, conflicts).
- Backoff retries with capped attempts.
- No blind replay of conflicting mutations.

Acceptance:
- Portal permissions enforce view vs manage actions.
- Sync conflicts are visible and actionable.

Gate 7->8:
- Portal and sync flows stable on staging.
- No P0/P1 open.

---

## Phase 8 - Hardening, Accessibility, UAT
Goal: release readiness.

Scope:
- WCAG 2.1 AA audit.
- Performance and bundle hardening.
- E2E smoke paths per major role.
- UAT pack + release notes + rollback rehearsal.

Measurable acceptance:
- 0 critical accessibility violations.
- Key route LCP < 2.5s and CLS < 0.1.
- Smoke suite passes for Admin, Manager/Supervisor, Engineer, Portal role.

---

## RACI Matrix
| Area | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Frontend architecture | Frontend Tech Lead | Engineering Manager | Backend Lead, Security | Product, QA |
| API contract governance | Backend Lead | Engineering Manager | Frontend Lead, Product | QA |
| UX and copy | Product Designer | Product Owner | Frontend Lead | QA |
| Testing strategy | QA Lead | Engineering Manager | Frontend Lead | Product |
| Release and rollback | DevOps Lead | Engineering Manager | Backend + Frontend Leads | Product + QA |

---

## Sprint Mapping (Suggested)
| Phase | Duration | Exit Artifact |
|---|---|---|
| 0 | 0.5-1 sprint | Governance pack + enforced PR/branch rules |
| 1 | 1 sprint | Auth shell + API/error adapters |
| 2 | 1-2 sprints | Admin workspace |
| 3 | 1-2 sprints | Sites/materials/assets + imports |
| 4 | 2 sprints | Visit lifecycle + review |
| 5 | 1-2 sprints | Workorders/escalations/daily plans |
| 6 | 1 sprint | KPI/analytics/report center |
| 7 | 1 sprint | Portal + sync monitoring |
| 8 | 1 sprint | Hardening + UAT signoff |

---

## Test Matrix
| Phase | Unit | Integration | E2E |
|---|---|---|---|
| 1 | auth client + adapters | auth endpoints and refresh | login/logout/refresh |
| 2 | forms/grids/guards | users/roles/settings APIs | admin CRUD smoke |
| 3 | import validators/stock actions | sites/assets/materials APIs | site import + stock flow |
| 4 | visit state UI logic | visit/evidence/review APIs | engineer + reviewer flow |
| 5 | board/escalation planners | WO/escalation/daily-plan APIs | WO lifecycle smoke |
| 6 | filter/chart mappers | KPI/analytics/report APIs | dashboard + export smoke |
| 7 | portal guards + sync UI | portal/sync APIs | portal + conflict flow |
| 8 | regression coverage | end-to-end integration checks | release smoke suite |

---

## Rollback Criteria by Gate
- Rollback required if any of the following occurs after phase rollout:
  - repeated 5xx on critical route > 2% for 15 min
  - auth/session failure affecting > 5% active users
  - portal scope leakage or permission breach
  - unrecoverable sync conflict spike blocking field operations

Approval chain: Tech Lead + QA Lead + Product Owner.

---

## Maintenance Rules
- Update this document whenever frontend scope, contracts, gates, or standards change.
- Update `docs/Api-Doc.md` and `docs/Frontend-Reporting-API-Contract-and-Git-Plan.md` for contract updates.
- Keep references aligned with `docs/Documentation-Index.md`.
