# Incident Runbook: Database Migration and Rollback

## Purpose
Safe execution and rollback steps for schema migration deployment on staging/production.

## Scope
- Forward migration execution (`forward-idempotent.sql`).
- Post-migration verification.
- Rollback decision path and recovery actions.

## Preconditions
1. Approved release tag exists (`vX.Y.Z` or release candidate tag).
2. Build and required tests are green in GitHub Actions.
3. DB credentials are stored in environment secrets.
4. A rollback strategy is prepared before execution.

## Forward Migration Procedure
1. Generate/confirm idempotent script:
```powershell
dotnet ef migrations script --idempotent -o artifacts/sql/forward-idempotent.sql `
  --project src/TowerOps.Infrastructure/TowerOps.Infrastructure.csproj `
  --startup-project src/TowerOps.Api/TowerOps.Api.csproj
```
2. Apply script to target DB (staging first):
```powershell
sqlcmd -S "<SQL_HOST>" -d "<DB_NAME>" -U "<USER>" -P "<PASS>" -i "artifacts/sql/forward-idempotent.sql"
```
3. Verify migration history:
```sql
SELECT MigrationId, ProductVersion
FROM __EFMigrationsHistory
ORDER BY MigrationId DESC;
```
4. Deploy API artifact to same environment after migration success.

## Post-Migration Smoke Validation
1. `GET /health` is `200`.
2. Auth flow:
   - `POST /api/auth/login` success.
3. Core operations:
   - visit read endpoint (`/api/visits/*`) success.
   - workorder read endpoint (`/api/workorders/*`) success.
4. No migration/runtime schema exceptions in logs.

## Rollback Decision Matrix
- Use rollback if:
  - startup fails due schema mismatch,
  - critical read/write endpoints fail with SQL exceptions,
  - irreversible data corruption risk is detected.

## Rollback Procedure
1. Stop API deployment rollout.
2. Restore last known good database backup if available.
3. Re-deploy last stable API artifact/tag.
4. Re-run smoke tests.
5. Open post-incident ticket with root cause and corrective action.

If full backup restore is not available:
1. Prepare and review a targeted reverse SQL script.
2. Execute reverse script in staging first.
3. Apply to production only after DBA signoff.

## Required Signoff
- Backend owner
- DBA owner
- QA owner

## Exit Criteria
- DB schema state aligns with deployed API.
- Smoke tests pass on target environment.
- Incident notes and follow-up tickets are recorded.

