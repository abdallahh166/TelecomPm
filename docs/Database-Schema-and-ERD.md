# Database Schema and ERD

## Purpose
This document is the maintained schema reference for frontend, backend, QA, and data/reporting teams.

Source of truth:
- `src/TowerOps.Infrastructure/Persistence/ApplicationDbContext.cs`
- `src/TowerOps.Infrastructure/Persistence/Configurations/*`
- `src/TowerOps.Infrastructure/Persistence/Migrations/*`

## Scope
- Includes persisted entities currently registered in EF Core DbContext.
- Includes high-level logical relationships for operational workflows.
- Marks inferred relationships explicitly where linkage is by business key (for example `SiteCode`) instead of direct FK property.

## Physical Entity Inventory

### Visits
- `Visit`
- `VisitPhoto`
- `VisitReading`
- `VisitChecklist`
- `VisitMaterialUsage`
- `VisitIssue`
- `VisitApproval`

### Sites
- `Site`
- `SiteTowerInfo`
- `SitePowerSystem`
- `SiteRadioEquipment`
- `SiteTransmission`
- `SiteCoolingSystem`
- `SiteFireSafety`
- `SiteSharing`

### Work Execution and Governance
- `WorkOrder`
- `Escalation`
- `ApprovalRecord`
- `AuditLog`

### Users and Access
- `User`
- `ApplicationRole`
- `Office`
- `PasswordResetToken`
- `RefreshToken`

### Planning
- `DailyPlan`
- `EngineerDayPlan` (owned/persisted via DailyPlan aggregate mapping)
- `PlannedVisitStop` (owned/persisted via DailyPlan aggregate mapping)

### Inventory and Assets
- `Material`
- `MaterialTransaction`
- `Asset`
- `UnusedAsset`
- `BatteryDischargeTest`

### Client / Portal / Configuration
- `Client`
- `SystemSetting`
- `SyncQueue`
- `SyncConflict`
- `ChecklistTemplate`
- `UserDataExportRequest`

## High-Level ERD (Logical)

```mermaid
erDiagram
    OFFICE ||--o{ USER : employs
    OFFICE ||--o{ SITE : owns
    OFFICE ||--o{ DAILY_PLAN : schedules

    DAILY_PLAN ||--o{ ENGINEER_DAY_PLAN : contains
    ENGINEER_DAY_PLAN ||--o{ PLANNED_VISIT_STOP : orders

    SITE ||--o{ VISIT : hosts
    USER ||--o{ VISIT : executes

    VISIT ||--o{ VISIT_PHOTO : has
    VISIT ||--o{ VISIT_READING : has
    VISIT ||--o{ VISIT_CHECKLIST : has
    VISIT ||--o{ VISIT_ISSUE : has
    VISIT ||--o{ VISIT_MATERIAL_USAGE : has
    VISIT ||--o{ VISIT_APPROVAL : has

    SITE ||--o{ SITE_TOWER_INFO : details
    SITE ||--o{ SITE_POWER_SYSTEM : details
    SITE ||--o{ SITE_RADIO_EQUIPMENT : details
    SITE ||--o{ SITE_TRANSMISSION : details
    SITE ||--o{ SITE_COOLING_SYSTEM : details
    SITE ||--o{ SITE_FIRE_SAFETY : details
    SITE ||--o{ SITE_SHARING : details

    MATERIAL ||--o{ MATERIAL_TRANSACTION : movements

    USER ||--o{ PASSWORD_RESET_TOKEN : resets
    USER ||--o{ REFRESH_TOKEN : sessions
    USER ||--o{ USER_DATA_EXPORT_REQUEST : exports

    SYNC_QUEUE ||--o{ SYNC_CONFLICT : conflicts

    WORK_ORDER ||--o{ ESCALATION : escalates
```

## Relationship Notes (Important)
- `WorkOrder` currently links to site using business key fields (`SiteCode`, `OfficeCode`) instead of direct `SiteId` FK property.
- Portal scoping uses `Site.ClientCode` and user portal claims (`User.ClientCode`, `User.IsClientPortalUser`).
- Visit evidence exposure to reports/portal is filtered by `VisitPhoto.FileStatus == Approved`.
- Soft delete global filter applies to entities inheriting `Entity<Guid>` (`IsDeleted == false` by default query filter).

## Data Governance Fields
Key governance fields that impact retention/privacy behavior:
- `IsDeleted`, `DeletedAt` (soft delete lifecycle)
- `IsUnderLegalHold` (purge block)
- timestamps (`CreatedAt`, `UpdatedAt`, domain-specific occurred/measured fields)

## Change Management Rule
When a migration adds/removes entity shape:
1. Update this document in the same PR.
2. Link migration file names in PR description.
3. Run `tools/check_doc_drift.py`.

