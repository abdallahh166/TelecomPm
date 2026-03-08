# Incident Runbook: Startup and Configuration Failures

## Purpose
Operational guide for production/staging incidents where the API process starts then crashes during bootstrap due to invalid configuration.

## Typical Symptoms
- IIS/AppPool startup crash (`0xe0434352`).
- Fatal log: `Cors:AllowedOrigins cannot contain localhost origins in Production.`
- Fatal or recurring error: `No valid combination of account information found.` from `BlobServiceClient`.
- Fatal log: `JWT secret key is not configured.`

## Affected Components
- `src/TowerOps.Api/Program.cs`
- `src/TowerOps.Api/Security/ApiSecurityHardening.cs`
- `src/TowerOps.Infrastructure/Services/BlobStorageService.cs`
- deployment workflow generated `web.config` environment variables

## Immediate Containment
1. Stop traffic to the failing environment (maintenance page or temporary health-route block).
2. Capture last 15 minutes logs and correlation IDs.
3. Freeze further deploys until config is corrected.

## Triage Checklist
1. Validate `ASPNETCORE_ENVIRONMENT`:
   - must be `Production` on prod slot.
2. Validate CORS origins:
   - `Cors:AllowedOrigins` must not include any `localhost` entry in Production.
   - include only real frontend origins (for example: `https://towerops.runasp.net`).
3. Validate auth secret:
   - `JWT_SECRET` must be non-empty and strong (minimum 32 chars).
4. Validate DB connection:
   - `ConnectionStrings__DefaultConnection` must resolve to target SQL host/database.
5. Validate blob storage:
   - `AzureBlobStorage:ConnectionString` must be a valid Azure Storage connection string.
   - if blob integration is not ready, disable feature flags that instantiate scan/upload services.

## Verification Commands
Use these on deployment runner or local shell before deploy:

```powershell
dotnet build TowerOps.sln -c Release
dotnet test tests/TowerOps.Application.Tests/TowerOps.Application.Tests.csproj -c Release --no-build
```

For staging/prod config review in workflow-generated `web.config`, ensure these variables exist:
- `ASPNETCORE_ENVIRONMENT`
- `JWT_SECRET`
- `ConnectionStrings__DefaultConnection`
- `Cors__AllowedOrigins__0` (and additional indexes as needed)
- `AzureBlobStorage__ConnectionString` (if blob-backed uploads are enabled)

## Recovery Procedure
1. Fix environment secrets/variables in GitHub environment (`staging` or `production`).
2. Re-run deploy workflow for the same artifact.
3. Validate:
   - `GET /health` returns `200`.
   - `POST /api/auth/login` returns `200` for seeded admin.
   - no fatal startup logs for CORS/blob/JWT.
4. Record incident summary and root cause in ops log.

## Exit Criteria
- App starts without fatal exceptions.
- Health check and login pass.
- No repeating startup exceptions in 10-minute observation window.

