# Incident Runbook: Sync Conflict Replay

## Purpose
Guide for handling high conflict rates in offline sync batches and replaying failed operations safely.

## Scope
- Endpoints:
  - `POST /api/sync`
  - `GET /api/sync/status/{deviceId}`
  - `GET /api/sync/conflicts/{engineerId}`
- Entities:
  - `SyncQueue`
  - `SyncConflict`

## Trigger Conditions
- Conflict ratio exceeds threshold from observability baseline.
- Repeated sync retries from same `deviceId`.
- Field users blocked from submitting visits due stale/offline payloads.

## Triage Steps
1. Identify impacted engineer/device:
   - query `GET /api/sync/status/{deviceId}`
   - query `GET /api/sync/conflicts/{engineerId}`
2. Classify conflict reason:
   - stale version
   - already submitted/closed entity
   - duplicate operation idempotency collision
3. Retrieve correlation IDs from failed responses/logs.
4. Validate current server-side entity state before replay.

## Replay Strategy
1. For idempotent and still-valid operations:
   - resubmit reduced conflict-free batch via `POST /api/sync`.
2. For stale data conflicts:
   - refresh latest server state on client.
   - reapply user-intended edits against latest version.
3. For finalized entities (submitted/approved/closed):
   - do not replay mutation.
   - mark operation as resolved with user notification.

## Safety Rules
- Never replay full batch blindly.
- Replay only operations that remain valid against current entity status.
- Keep operation ordering per entity to avoid new conflicts.
- Record manual conflict decisions for auditability.

## Operational SQL Checks (Read-Only)
```sql
SELECT TOP 100 *
FROM SyncConflicts
ORDER BY CreatedAtUtc DESC;

SELECT TOP 100 *
FROM SyncQueue
WHERE DeviceId = @DeviceId
ORDER BY EnqueuedAtUtc DESC;
```

## Exit Criteria
- Conflict queue for impacted engineer/device returns to baseline.
- Replay batch succeeds without new conflicts.
- Field user can continue visit/workorder flow.
- Incident summary logged with root cause category.

