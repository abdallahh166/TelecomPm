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
- Gap: API doc lists routes but does not include full request/response JSON examples per endpoint.
- Impact: Medium (integration onboarding speed).
- Recommendation: Add example payloads for high-traffic endpoints (visits, workorders, portal, imports).

### 2) Historical sprint artifacts
- Gap: Several sprint/assessment docs are historical snapshots and may conflict with latest behavior.
- Impact: Medium (reader confusion).
- Recommendation: Keep them marked as historical and avoid treating them as runtime source of truth.

### 3) Operational runbooks
- Gap: Limited incident runbooks for production troubleshooting (auth failures, migration rollback strategy, queue conflict replay).
- Impact: Medium to High (operations readiness).
- Recommendation: Add runbooks under `docs/ops/`.

### 4) Pagination contract consistency
- Gap: Some list endpoints still return raw arrays while others return `PagedResponse<T>`.
- Impact: Medium (frontend adapter complexity and inconsistent UX for total counts).
- Recommendation: Follow `docs/Pagination-Consistency-Matrix.md` remediation target list.

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
- [ ] Add endpoint payload examples for critical routes
- [x] Add ERD or schema map
- [x] Add unified file constraints matrix
- [x] Add pagination consistency matrix
- [ ] Add production runbooks
