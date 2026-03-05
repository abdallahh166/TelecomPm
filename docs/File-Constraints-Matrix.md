# File Constraints Matrix

## Purpose
This is the consolidated frontend/backend constraints reference for all upload and file-driven flows.

Primary sources:
- `src/TowerOps.Api/Controllers/VisitsController.cs`
- `src/TowerOps.Application/Commands/Imports/ImportGuardrails.cs`
- `src/TowerOps.Infrastructure/Services/UploadedFileValidationService.cs`
- `src/TowerOps.Infrastructure/Services/FileMalwareScanService.cs`
- `src/TowerOps.Infrastructure/Services/UploadScanProcessor.cs`
- `src/TowerOps.Domain/Entities/Visits/VisitPhoto.cs`
- `src/TowerOps.Domain/ValueObjects/Signature.cs`
- `src/TowerOps.Infrastructure/Persistence/SeedData/DatabaseSeeder.cs`

## Unified Matrix
| Flow | Endpoint(s) | Accepted Type | Size / Volume Limits | Validation | Post-Upload Status | Visibility Rule |
|---|---|---|---|---|---|---|
| Visit photo upload | `POST /api/visits/{visitId}/photos` | `.jpg`, `.jpeg`, `.png`, `.pdf` | HTTP request limit: 25 MB (`RequestSizeLimit`) | Extension + magic-byte signature (`UploadedFileValidationService`) | `Pending` initially (`CreatePendingUpload`) | Reports/portal consume only `Approved` photos |
| Visit evidence import (panorama/alarms/unused assets) | `POST /api/visits/{visitId}/import/*` | Excel payload (`.xlsx/.xlsm/.xls` signatures) | `Import:MaxFileSizeBytes` (default 10 MB); `Import:MaxRows` (default 5000) | Excel signature check + row limit + row-level parsing | Imported photos are created via command logic; scan pipeline applies if file entities are produced | Consumer queries should filter by approval where applicable |
| Site/asset/radio/power/sharing/rf/bdt/delta imports | `POST /api/sites/import*` | Excel payload (`.xlsx/.xlsm/.xls` signatures) | `Import:MaxFileSizeBytes` default 10 MB; `Import:MaxRows` default 5000 | Import guardrails + per-row business validation | N/A (data upsert/import result object) | Not file-serving flow |
| Checklist template import | `POST /api/checklisttemplates/import` | Excel payload | Import guardrails | Template schema and row parsing | N/A | Not file-serving flow |
| Digital signature capture | `POST /api/visits/{id}/signature`, `POST /api/workorders/{id}/signature` | Base64 PNG | Max 150 KB decoded bytes | Base64 decode + PNG header validation | Stored as value object | Read endpoints return stored signature metadata/data |

## Upload Security Pipeline

### Status lifecycle
`VisitPhoto.FileStatus` lifecycle:
- `Pending` on upload
- `Approved` after clean scan
- `Quarantined` on malware or validation failure path

Implementation:
- `src/TowerOps.Domain/Entities/Visits/VisitPhoto.cs`
- `src/TowerOps.Infrastructure/Services/UploadScanProcessor.cs`

### Scanner provider behavior
Configured setting:
- `UploadSecurity:MalwareScan:Provider` (default `ClamAV`)

Provider outcomes in current code:
- `ClamAV`: implemented TCP `INSTREAM` scan
- `AzureDefender`: currently returns `"Azure Defender scanner integration is not configured."`

Implementation:
- `src/TowerOps.Infrastructure/Services/FileMalwareScanService.cs`

### Scan worker cadence
Seeded defaults:
- `UploadSecurity:Scan:Enabled = true`
- `UploadSecurity:Scan:IntervalSeconds = 60`
- `UploadSecurity:Scan:BatchSize = 100`

Source:
- `src/TowerOps.Infrastructure/Persistence/SeedData/DatabaseSeeder.cs`

## Import Guardrails (Global)

Resolved via settings:
- `Import:SkipInvalidRows` (default `true`)
- `Import:MaxRows` (default `5000`)
- `Import:MaxFileSizeBytes` (default `10485760`)
- `Import:DefaultDateFormat` (default `dd/MM/yyyy`)

Behavior:
- Reject if payload is empty.
- Reject if file size exceeds configured max.
- Reject if not recognized as Excel by file signature.
- Reject if non-empty row count exceeds configured max.
- If `SkipInvalidRows=false`, any invalid row fails the whole import.

Source:
- `src/TowerOps.Application/Commands/Imports/ImportGuardrails.cs`

## Frontend Implementation Notes
- Pre-validate extension and max size client-side before upload/import call.
- For photo UX, show `Pending` state after successful upload request, and refresh evidence status.
- Never show quarantined files in portal/report viewers.
- Treat import failures as structured validation/business errors and render row-level details from import result payload.

