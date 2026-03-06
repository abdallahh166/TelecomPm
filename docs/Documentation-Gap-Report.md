# Documentation Gap Report

## Summary
This report captures documentation areas that still need follow-up to keep docs fully synchronized with implementation details.

## Current Status
- Core runtime docs have been aligned:
  - `docs/Api-Doc.md`
  - `docs/Application-Doc.md`
  - `docs/Domain-Doc.md`
  - `docs/Backend-Auto-Discovery-Report.md`
  - `docs/CQRS-Inventory.md`
  - `docs/Database-Schema-and-ERD.md`
  - `docs/File-Constraints-Matrix.md`
  - `docs/Pagination-Consistency-Matrix.md`
  - phase overview docs (`docs/phase-*/00-phase-overview.md`)
- Controller coverage drift check passes via `tools/check_doc_drift.py`.

## Remaining Gaps

### 1) DTO contract examples
- Status: High-traffic examples are now documented in `docs/Api-Doc.md` (auth login, visits pending reviews, materials list, users list, portal workorders).
- Remaining gap: not every endpoint has a dedicated request/response JSON example yet.
- Impact: Low to Medium (edge endpoint onboarding speed).
- Recommendation: Extend examples incrementally for less frequently used endpoints.

### 2) Historical sprint artifacts
- Gap: Several sprint/assessment docs are historical snapshots and may conflict with latest behavior.
- Impact: Medium (reader confusion).
- Recommendation: Keep them marked as historical and avoid treating them as runtime source of truth.

### 3) Operational runbooks
- Status: Implemented under `docs/ops/`:
  - `Incident-Runbook-Startup-Configuration-Failures.md`
  - `Incident-Runbook-Database-Migration-and-Rollback.md`
  - `Incident-Runbook-Sync-Conflict-Replay.md`
- Remaining gap: add environment-specific on-call contacts/escalation matrix outside repository if required by operations policy.

### 4) Pagination contract consistency
- Status: High-volume list endpoints now standardized to `PagedResponse<T>`:
  - `GET /api/materials`
  - `GET /api/users/office/{officeId}`
  - `GET /api/users/role/{role}`
  - `GET /api/visits/pending-reviews`
  - `GET /api/visits/scheduled`
- Remaining gap: a small set of list endpoints still return arrays (`/api/sites/maintenance`, `/api/materials/low-stock/{officeId}`).
- Impact: Low.
- Recommendation: Keep the remaining migration in backlog as non-blocker.
### 5) Business confirmations and implementation closure
- Status: BC-05, BC-06, and BC-08 are implemented and merged.
- Impact: Low (remaining work is operational rollout validation, not implementation closure).
- Recommendation: Run staging retention dry-run verification and archive BC delivery tickets as complete.
- Tracking file: `docs/Business-Confirmation-Checklist.md`
- Issue tracking:
  - BC-01: `#47`
  - BC-02: `#48`
  - BC-03: `#49`
  - BC-04: `#50`
  - BC-05: `#51`
  - BC-06: `#52`
  - BC-07: `#53`
  - BC-08: `#54`
- Execution plan: `docs/phase-2/18-business-confirmation-implementation-pr-slices.md`

## Assumptions
- Source code and tests remain the final authority for behavior.
- Historical docs are retained for traceability, not for active implementation contracts.

## Follow-up Checklist
- [x] Add auto-generated command/query catalog
- [x] Add endpoint payload examples for critical routes
- [x] Add ERD or schema map
- [x] Add unified file constraints matrix
- [x] Add pagination consistency matrix
- [x] Add production runbooks
