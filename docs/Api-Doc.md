# TowerOps API Documentation

## Purpose
This document describes the current ASP.NET Core API surface in `src/TowerOps.Api`, including runtime behavior, authorization policies, and endpoint contracts at controller level for the **TowerOps** product by **Seven Pictures**.

Branding note:
- Product brand: `TowerOps`
- Internal code namespaces/project names: `TowerOps` / `TowerOps` (kept for compatibility)

## Runtime Architecture
- Framework: ASP.NET Core Web API (`net8.0`)
- API style: controller-based REST endpoints
- Auth: JWT bearer token
- Authorization: policy + permission claims
- Validation: FluentValidation through MediatR pipeline and model-state filter
- Error handling: centralized `ExceptionHandlingMiddleware` with localized messages
- Logging: Serilog + request logging middleware
- Correlation: `X-Correlation-ID` request/response propagation with scoped logging
- Localization: `en-US`, `ar-EG` via query string, `Accept-Language`, or cookie
- Abuse controls: global path-scoped rate limiting for `/api/auth/*`, `/api/sync*`, and `*/import*`
- Transport security: HSTS enabled in Production
- Health checks: `GET /health`
- Swagger/OpenAPI: enabled in Development

## Configuration and Environment
Primary config file: `src/TowerOps.Api/appsettings.json`

Critical settings:
- `ConnectionStrings:DefaultConnection`
- `JwtSettings:Issuer`
- `JwtSettings:Audience`
- `Localization:*`
- `Cors:AllowedOrigins` (required and explicit in Production)
- `RateLimiting:*`
- `Hsts:*`
- `Settings:EncryptionKey`

Environment variables:
- `JWT_SECRET`
  - required in Production (startup guard)
  - Development fallback can come from `appsettings.Development.json`

## Security Model
### Authentication
- `POST /api/auth/login` is anonymous and returns JWT + refresh token.
  - Request supports optional `mfaCode` (required for Admin/Manager accounts once MFA is enabled).
- `POST /api/auth/refresh` rotates refresh token and returns a new token pair.
- `POST /api/auth/logout` revokes the presented refresh token.
- `POST /api/auth/mfa/setup` initializes TOTP MFA secret using email/password credentials.
- `POST /api/auth/mfa/verify` verifies TOTP code and enables MFA for the account.
- Other protected endpoints require bearer token.

### Authorization policies
Defined in `src/TowerOps.Api/Authorization/ApiAuthorizationPolicies.cs`:
- `CanManageWorkOrders`
- `CanViewWorkOrders`
- `CanManageVisits`
- `CanViewVisits`
- `CanReviewVisits`
- `CanCreateEscalations`
- `CanManageEscalations`
- `CanViewEscalations`
- `CanViewKpis`
- `CanManageUsers`
- `CanViewUsers`
- `CanManageOffices`
- `CanManageSites`
- `CanViewSites`
- `CanViewAnalytics`
- `CanViewReports`
- `CanViewMaterials`
- `CanManageMaterials`
- `CanManageSettings`
- `CanViewPortal`
- `CanManagePortalWorkOrders`

Policies evaluate permission claims (`PermissionConstants.ClaimType`), not hardcoded roles.

## Data Flow (Request Path)
1. HTTP request reaches controller endpoint.
2. AuthN/AuthZ middleware validates token and policy.
3. Controller maps contract DTOs to commands/queries.
4. MediatR pipeline executes:
   - unhandled exception behavior
   - logging behavior
   - validation behavior
   - performance behavior
   - transaction behavior (commands)
5. Handler executes domain/application logic and persistence via repositories/unit of work.
6. Domain events are dispatched from `ApplicationDbContext.SaveChangesAsync`.
7. Controller returns standardized success/failure envelope through `ApiControllerBase.HandleResult`.

## Controllers and Endpoints

### AuthController (`/api/auth`)
- `POST /login` (`AllowAnonymous`)
- `POST /forgot-password` (`AllowAnonymous`)
- `POST /reset-password` (`AllowAnonymous`)
- `POST /change-password` (`Authorize`)
- `POST /refresh` (`AllowAnonymous`)
- `POST /logout` (`AllowAnonymous`)
- `POST /mfa/setup` (`AllowAnonymous`)
- `POST /mfa/verify` (`AllowAnonymous`)

### VisitsController (`/api/visits`) class policy: `CanViewVisits`
- `GET /{visitId}`
- `GET /engineers/{engineerId}`
- `GET /pending-reviews` (supports `officeId`, `page`, `pageSize`)
- `GET /scheduled` (supports `date`, `engineerId`, `page`, `pageSize`)
- `GET /{visitId}/evidence-status`
- `GET /{visitId}/signature`
- `POST /` (`CanManageVisits`)
- `POST /{visitId}/start` (`CanManageVisits`)
- `POST /{visitId}/checkin` (`CanManageVisits`)
- `POST /{visitId}/checkout` (`CanManageVisits`)
- `POST /{visitId}/complete` (`CanManageVisits`)
- `POST /{visitId}/submit` (`CanManageVisits`)
- `POST /{visitId}/approve` (`CanReviewVisits`)
- `POST /{visitId}/reject` (`CanReviewVisits`)
- `POST /{visitId}/request-correction` (`CanReviewVisits`)
- `POST /{visitId}/checklist-items` (`CanManageVisits`)
- `PATCH /{visitId}/checklist-items/{checklistItemId}` (`CanManageVisits`)
- `POST /{visitId}/issues` (`CanManageVisits`)
- `POST /{visitId}/issues/{issueId}/resolve` (`CanManageVisits`)
- `POST /{visitId}/readings` (`CanManageVisits`)
- `PATCH /{visitId}/readings/{readingId}` (`CanManageVisits`)
- `POST /{visitId}/photos` (`CanManageVisits`)
- `DELETE /{visitId}/photos/{photoId}` (`CanManageVisits`)
- `POST /{visitId}/cancel` (`CanManageVisits`)
- `POST /{visitId}/reschedule` (`CanManageVisits`)
- `POST /{visitId}/signature` (`CanManageVisits`)
- `POST /{visitId}/import/panorama` (`CanManageVisits`)
- `POST /{visitId}/import/alarms` (`CanManageVisits`)
- `POST /{visitId}/import/unused-assets` (`CanManageVisits`)

### WorkOrdersController (`/api/workorders`) class policy: `Authorize`
- `POST /` (`CanManageWorkOrders`)
- `GET /{workOrderId}` (`CanViewWorkOrders`)
- `POST /{workOrderId}/assign` (`CanManageWorkOrders`)
- `PATCH /{id}/start` (`CanManageWorkOrders`)
- `PATCH /{id}/complete` (`CanManageWorkOrders`)
- `PATCH /{id}/close` (`CanManageWorkOrders`)
- `PATCH /{id}/cancel` (`CanManageWorkOrders`)
- `PATCH /{id}/submit-for-acceptance` (`CanManageWorkOrders`)
- `PATCH /{id}/customer-accept` (`CanManageWorkOrders`)
- `PATCH /{id}/customer-reject` (`CanManageWorkOrders`)
- `POST /{id}/signature` (`CanManageWorkOrders`)
- `GET /{id}/signature` (`CanViewWorkOrders`)

### EscalationsController (`/api/escalations`) class policy: `Authorize`
- `POST /` (`CanCreateEscalations`)
- `GET /{escalationId}` (`CanViewEscalations`)
- `PATCH /{id}/review` (`CanManageEscalations`)
- `PATCH /{id}/approve` (`CanManageEscalations`)
- `PATCH /{id}/reject` (`CanManageEscalations`)
- `PATCH /{id}/close` (`CanManageEscalations`)

### SitesController (`/api/sites`) class policy: `CanViewSites`
- `GET /{siteId}`
- `GET /{siteCode}/location`
- `GET /office/{officeId}`
- `GET /maintenance`
- `POST /` (`CanManageSites`)
- `PUT /{siteId}` (`CanManageSites`)
- `PATCH /{siteId}/status` (`CanManageSites`)
- `POST /{siteId}/assign` (`CanManageSites`)
- `POST /{siteId}/unassign` (`CanManageSites`)
- `PUT /{siteCode}/ownership` (`CanManageSites`)
- `POST /import` (`CanManageSites`)
- `POST /import/site-assets` (`CanManageSites`)
- `POST /import/power-data` (`CanManageSites`)
- `POST /import/radio-data` (`CanManageSites`)
- `POST /import/tx-data` (`CanManageSites`)
- `POST /import/sharing-data` (`CanManageSites`)
- `POST /import/rf-status` (`CanManageSites`)
- `POST /import/battery-discharge-tests` (`CanManageSites`)
- `POST /import/delta-sites` (`CanManageSites`)

### MaterialsController (`/api/materials`) class policy: `CanViewMaterials`
- `GET /{id}`
- `GET /` (supports `officeId`, `onlyInStock`, `page`, `pageSize`)
- `GET /low-stock/{officeId}`
- `POST /` (`CanManageMaterials`)
- `PUT /{id}` (`CanManageMaterials`)
- `DELETE /{id}` (`CanManageMaterials`)
- `POST /{id}/stock/add` (`CanManageMaterials`)
- `POST /{id}/stock/reserve` (`CanManageMaterials`)
- `POST /{id}/stock/consume` (`CanManageMaterials`)

### ReportsController (`/api/reports`) class policy: `CanViewReports`
- `GET /visits/{visitId}`
- `GET /scorecard`
- `GET /checklist`
- `GET /bdt`
- `GET /data-collection`

### AnalyticsController (`/api/analytics`) class policy: `CanViewAnalytics`
- `GET /engineer-performance/{engineerId}`
- `GET /site-maintenance/{siteId}`
- `GET /office-statistics/{officeId}`
- `GET /material-usage/{materialId}`
- `GET /visit-completion-trends`
- `GET /issue-analytics`

### KpiController (`/api/kpi`) class policy: `Authorize`
- `GET /operations` (`CanViewKpis`)

### UsersController (`/api/users`) class policy: `CanViewUsers`
- `GET /{userId}`
- `GET /office/{officeId}` (supports `onlyActive`, `page`, `pageSize`)
- `GET /role/{role}` (supports `officeId`, `page`, `pageSize`)
- `GET /{userId}/performance`
- `POST /` (`CanManageUsers`)
- `PUT /{userId}` (`CanManageUsers`)
- `DELETE /{userId}` (`CanManageUsers`)
- `PATCH /{userId}/role` (`CanManageUsers`)
- `PATCH /{userId}/activate` (`CanManageUsers`)
- `PATCH /{userId}/deactivate` (`CanManageUsers`)
- `PATCH /{userId}/unlock-account` (`CanManageUsers`)

### DataExportsController (`/api/data-exports`) class policy: `Authorize`
- `POST /me`
  - creates authenticated user's operational data export snapshot (JSON)
  - returns export request metadata (`requestId`, `requestedAtUtc`, `expiresAtUtc`, `status`)
- `GET /me/{requestId}`
  - downloads the previously requested JSON export for the same authenticated user
  - request expires based on `Privacy:Export:TtlDays` (default 30)
  - returns `application/json` file payload

### OfficesController (`/api/offices`) class policy: `CanManageOffices`
- `POST /`
- `GET /{officeId}`
- `GET /` (supports `onlyActive`, `page`, `pageSize`, `sortBy`, `sortDir`; `pageSize` capped at 100)
- `GET /region/{region}`
- `GET /{officeId}/statistics`
- `PUT /{officeId}`
- `PATCH /{officeId}/contact`
- `DELETE /{officeId}`

### ChecklistTemplatesController (`/api/checklisttemplates`) class policy: `Authorize`
- `GET /`
- `GET /{id}`
- `GET /history`
- `POST /` (`CanManageWorkOrders`)
- `POST /{id}/activate` (`CanManageWorkOrders`)
- `POST /import` (`CanManageWorkOrders`)

### AssetsController (`/api/assets`) class policy: `Authorize`
- `GET /site/{siteCode}` (`CanViewSites`)
- `GET /{assetCode}` (`CanViewSites`)
- `GET /{assetCode}/history` (`CanViewSites`)
- `POST /` (`CanManageSites`)
- `PUT /{assetCode}/service` (`CanManageSites`)
- `PUT /{assetCode}/fault` (`CanManageSites`)
- `PUT /{assetCode}/replace` (`CanManageSites`)
- `GET /expiring-warranties` (`CanViewSites`)
- `GET /faulty` (`CanViewSites`)

### ClientPortalController (`/api/portal`) class policy: `CanViewPortal`
- `GET /dashboard`
- `GET /sites` (supports `page`, `pageSize`, `sortBy`, `sortDir`)
- `GET /sites/{siteCode}`
- `GET /workorders` (supports `page`, `pageSize`, `sortBy`, `sortDir`)
- `GET /sla-report`
- `GET /visits/{siteCode}` (supports `page`, `pageSize`, `sortBy`, `sortDir`)
- `GET /visits/{visitId}/evidence`
- `PATCH /workorders/{id}/accept` (`CanManagePortalWorkOrders`)
- `PATCH /workorders/{id}/reject` (`CanManagePortalWorkOrders`)

### DailyPlansController (`/api/daily-plans`) class policy: `CanManageSites`
- `POST /`
- `GET /{officeId}/{date}`
- `POST /{planId}/assign`
- `DELETE /{planId}/assign`
- `GET /{planId}/suggest/{engineerId}`
- `GET /{officeId}/{date}/unassigned`
- `POST /{planId}/publish`

### SyncController (`/api/sync`) class policy: `CanManageVisits`
- `POST /`
- `GET /status/{deviceId}`
- `GET /conflicts/{engineerId}`

### SettingsController (`/api/settings`) class policy: `CanManageSettings`
- `GET /` (supports `page`, `pageSize`, `sortBy`, `sortDir`; `pageSize` capped at 100)
- `GET /{group}`
- `PUT /`
- `POST /test/{service}`

### RolesController (`/api/roles`) class policy: `CanManageSettings`
- `GET /` (supports `page`, `pageSize`, `sortBy`, `sortDir`; `pageSize` capped at 100)
- `GET /permissions`
- `GET /{id}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`

## Pagination Contract
List endpoints that support paging return:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Query parameters for paged list endpoints:
- `page` (default `1`)
- `pageSize` (default `25`, max `100`)
- `sortBy` (endpoint allowlist enforced)
- `sortDir` (`asc` or `desc`, default `desc`)

## High-Traffic JSON Examples

### `POST /api/auth/login` request
```json
{
  "email": "admin@towerops.com",
  "password": "P@ssw0rd123!",
  "mfaCode": "123456"
}
```

### `POST /api/auth/login` success (`200`)
```json
{
  "accessToken": "<jwt>",
  "expiresAtUtc": "2026-03-05T10:30:00Z",
  "refreshToken": "<refresh-token>",
  "refreshTokenExpiresAtUtc": "2026-03-12T10:15:00Z",
  "userId": "11111111-1111-1111-1111-111111111111",
  "email": "admin@towerops.com",
  "role": "Admin",
  "officeId": "22222222-2222-2222-2222-222222222222",
  "requiresPasswordChange": false
}
```

### `GET /api/visits/pending-reviews?officeId={officeId}&page=1&pageSize=25` success (`200`)
```json
{
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "visitNumber": "VST-20260305-0012",
      "siteId": "44444444-4444-4444-4444-444444444444",
      "siteCode": "CAI-0187",
      "siteName": "Cairo East Hub",
      "engineerId": "55555555-5555-5555-5555-555555555555",
      "engineerName": "Ahmed Ali",
      "supervisorName": "Mona Ibrahim",
      "technicianNames": ["Tech A", "Tech B"],
      "scheduledDate": "2026-03-05T08:00:00Z",
      "actualStartTime": "2026-03-05T08:15:00Z",
      "actualEndTime": null,
      "engineerReportedCompletionTimeUtc": null,
      "duration": null,
      "status": "Submitted",
      "type": "CM",
      "completionPercentage": 100,
      "canBeEdited": false,
      "canBeSubmitted": false,
      "engineerNotes": "Awaiting review",
      "reviewerNotes": null,
      "createdAt": "2026-03-05T07:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 17,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### `GET /api/materials?officeId={officeId}&onlyInStock=true&page=1&pageSize=25` success (`200`)
```json
{
  "data": [
    {
      "id": "66666666-6666-6666-6666-666666666666",
      "code": "MAT-CBL-001",
      "name": "RF Coaxial Cable",
      "description": "50 Ohm outdoor cable",
      "category": "Cable",
      "currentStock": 124.5,
      "unit": "Meter",
      "minimumStock": 50,
      "unitCost": 120.0,
      "currency": "EGP",
      "isLowStock": false,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 42,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### `GET /api/users/office/{officeId}?onlyActive=true&page=1&pageSize=25` success (`200`)
```json
{
  "data": [
    {
      "id": "77777777-7777-7777-7777-777777777777",
      "name": "Sara Mahmoud",
      "email": "sara@towerops.com",
      "phoneNumber": "01012345678",
      "role": "Manager",
      "officeId": "22222222-2222-2222-2222-222222222222",
      "officeName": "Cairo Office",
      "isActive": true,
      "assignedSitesCount": 12,
      "maxAssignedSites": 20,
      "performanceRating": 4.6
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 6,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### `GET /api/portal/workorders?page=1&pageSize=25&sortBy=createdAt&sortDir=desc` success (`200`)
```json
{
  "data": [
    {
      "workOrderId": "88888888-8888-8888-8888-888888888888",
      "siteCode": "CAI-0187",
      "status": "PendingCustomerAcceptance",
      "priority": "P2",
      "slaDeadline": "2026-03-07T12:00:00Z",
      "createdAt": "2026-03-05T08:00:00Z",
      "completedAt": "2026-03-05T09:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 9,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Error Handling and Localization
- Exceptions are normalized by `ExceptionHandlingMiddleware`.
- Domain/Application exceptions support localized message keys.
- Validation errors return structured `Errors` dictionary and localized messages.

Unified error contract for failed requests:
```json
{
  "code": "request.failed",
  "message": "Human-readable localized message",
  "correlationId": "X-Correlation-ID value",
  "errors": {
    "fieldName": ["validation message"]
  },
  "meta": {
    "Rule": "BusinessRuleName"
  }
}
```
Notes:
- `errors` and `meta` are optional and appear only when applicable.
- Stable error codes include: `internal.error`, `request.failed`, `request.validation_failed`,
  `resource.not_found`, `auth.unauthorized`, `auth.forbidden`, `request.conflict`,
  `business.rule_violation`.

## Operational Notes
- All business timestamps are UTC in domain/application logic.
- Request/response behaviors are mediated through commands/queries; controllers do not contain core business logic.
- Operational metrics are emitted from meter `TowerOps.Operations` for import/sync/notification flows.
- Keep this file aligned with controller route/attribute changes.
