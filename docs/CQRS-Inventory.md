# CQRS Inventory

## Purpose
This file gives a code-generated style inventory for Application-layer commands and queries to improve discoverability for frontend and integration teams.

Source paths:
- `src/TowerOps.Application/Commands`
- `src/TowerOps.Application/Queries`

Generated from code state as of: 2026-03-05

## Totals
- Command artifacts directory files: 298
- Query artifacts directory files: 136

## Module Summary
| Module | Command Artifacts | Query Artifacts |
|---|---:|---:|
| ApprovalRecords | 3 | 0 |
| Assets | 12 | 10 |
| AuditLogs | 3 | 0 |
| Auth | 24 | 0 |
| ChecklistTemplates | 6 | 6 |
| DailyPlans | 12 | 6 |
| Escalations | 15 | 2 |
| Imports | 12 | 0 |
| Kpi | 0 | 2 |
| Materials | 24 | 12 |
| Offices | 15 | 8 |
| Portal | 0 | 12 |
| Privacy | 1 | 1 |
| Reports | 7 | 14 |
| Roles | 9 | 4 |
| Settings | 3 | 4 |
| Signatures | 6 | 4 |
| Sites | 27 | 10 |
| Sync | 3 | 4 |
| Users | 27 | 10 |
| Visits | 57 | 24 |
| WorkOrders | 27 | 2 |

## Commands by Module

### ApprovalRecords
- `CreateApprovalRecordCommand`

### Assets
- `MarkAssetFaultyCommand`
- `RecordAssetServiceCommand`
- `RegisterAssetCommand`
- `ReplaceAssetCommand`

### AuditLogs
- `LogAuditEntryCommand`

### Auth
- `ChangePasswordCommand`
- `ForgotPasswordCommand`
- `GenerateMfaSetupCommand`
- `LoginCommand`
- `LogoutCommand`
- `RefreshTokenCommand`
- `ResetPasswordCommand`
- `VerifyMfaSetupCommand`

### ChecklistTemplates
- `ActivateChecklistTemplateCommand`
- `CreateChecklistTemplateCommand`

### DailyPlans
- `AssignSiteToEngineerCommand`
- `CreateDailyPlanCommand`
- `PublishDailyPlanCommand`
- `RemoveSiteFromEngineerCommand`

### Escalations
- `ApproveEscalationCommand`
- `CloseEscalationCommand`
- `CreateEscalationCommand`
- `RejectEscalationCommand`
- `ReviewEscalationCommand`

### Imports
- `ImportAlarmCaptureCommand`
- `ImportBatteryDischargeTestCommand`
- `ImportChecklistTemplateCommand`
- `ImportDeltaSitesCommand`
- `ImportPanoramaEvidenceCommand`
- `ImportPowerDataCommand`
- `ImportRFStatusCommand`
- `ImportSiteAssetsCommand`
- `ImportSiteRadioDataCommand`
- `ImportSiteSharingDataCommand`
- `ImportSiteTxDataCommand`
- `ImportUnusedAssetsCommand`

### Materials
- `AdjustStockCommand`
- `ConsumeMaterialCommand`
- `CreateMaterialCommand`
- `DeleteMaterialCommand`
- `ReserveMaterialCommand`
- `RestockMaterialCommand`
- `TransferMaterialCommand`
- `UpdateMaterialCommand`

### Offices
- `CreateOfficeCommand`
- `DeleteOfficeCommand`
- `UpdateOfficeCommand`
- `UpdateOfficeContactCommand`
- `UpdateOfficeStatisticsCommand`

### Privacy
- `RequestMyOperationalDataExportCommand`

### Reports
- `ExportBDTCommand`
- `ExportChecklistCommand`
- `ExportDataCollectionCommand`
- `ExportScorecardCommand`
- `GenerateContractorScorecardCommand`

### Roles
- `CreateApplicationRoleCommand`
- `DeleteApplicationRoleCommand`
- `UpdateApplicationRoleCommand`

### Settings
- `UpsertSystemSettingsCommand`

### Signatures
- `CaptureVisitSignatureCommand`
- `CaptureWorkOrderSignatureCommand`

### Sites
- `AssignEngineerToSiteCommand`
- `CreateSiteCommand`
- `DeleteSiteCommand`
- `ImportSiteDataCommand`
- `UnassignEngineerFromSiteCommand`
- `UpdateSiteCommand`
- `UpdateSiteComponentsCommand`
- `UpdateSiteOwnershipCommand`
- `UpdateSiteStatusCommand`

### Sync
- `ProcessSyncBatchCommand`

### Users
- `ActivateUserCommand`
- `AssignUserToOfficeCommand`
- `ChangeUserRoleCommand`
- `CreateUserCommand`
- `DeactivateUserCommand`
- `DeleteUserCommand`
- `UnlockUserAccountCommand`
- `UpdateUserCommand`
- `UpdateUserSpecializationsCommand`

### Visits
- `AddChecklistItemCommand`
- `AddIssueCommand`
- `AddPhotoCommand`
- `AddReadingCommand`
- `ApproveVisitCommand`
- `CancelVisitCommand`
- `CheckInVisitCommand`
- `CheckOutVisitCommand`
- `CompleteVisitCommand`
- `CreateVisitCommand`
- `RejectVisitCommand`
- `RemovePhotoCommand`
- `RequestCorrectionCommand`
- `RescheduleVisitCommand`
- `ResolveIssueCommand`
- `StartVisitCommand`
- `SubmitVisitCommand`
- `UpdateChecklistItemCommand`
- `UpdateReadingCommand`

### WorkOrders
- `AcceptByCustomerCommand`
- `AssignWorkOrderCommand`
- `CancelWorkOrderCommand`
- `CloseWorkOrderCommand`
- `CompleteWorkOrderCommand`
- `CreateWorkOrderCommand`
- `RejectByCustomerCommand`
- `StartWorkOrderCommand`
- `SubmitForCustomerAcceptanceCommand`

## Queries by Module

### Assets
- `GetAssetByCodeQuery`
- `GetAssetHistoryQuery`
- `GetExpiringWarrantiesQuery`
- `GetFaultyAssetsQuery`
- `GetSiteAssetsQuery`

### ChecklistTemplates
- `GetActiveChecklistTemplateQuery`
- `GetChecklistTemplateByIdQuery`
- `GetChecklistTemplateHistoryQuery`

### DailyPlans
- `GetDailyPlanQuery`
- `GetSuggestedOrderQuery`
- `GetUnassignedSitesQuery`

### Escalations
- `GetEscalationByIdQuery`

### Kpi
- `GetOperationsDashboardQuery`

### Materials
- `GetLowStockMaterialsQuery`
- `GetMaterialByIdQuery`
- `GetMaterialsByCategoryQuery`
- `GetMaterialsByOfficeQuery`
- `GetMaterialTransactionsQuery`
- `GetMaterialUsageReportQuery`

### Offices
- `GetAllOfficesQuery`
- `GetOfficeByIdQuery`
- `GetOfficesByRegionQuery`
- `GetOfficeStatisticsQuery`

### Portal
- `GetPortalDashboardQuery`
- `GetPortalSitesQuery`
- `GetPortalSlaReportQuery`
- `GetPortalVisitEvidenceQuery`
- `GetPortalVisitsQuery`
- `GetPortalWorkOrdersQuery`

### Privacy
- `GetMyOperationalDataExportQuery`

### Reports
- `GetEngineerPerformanceReportQuery`
- `GetIssueAnalyticsReportQuery`
- `GetMaterialUsageSummaryQuery`
- `GetOfficeStatisticsReportQuery`
- `GetSiteMaintenanceReportQuery`
- `GetVisitCompletionTrendsQuery`
- `GetVisitReportQuery`

### Roles
- `GetAllApplicationRolesQuery`
- `GetApplicationRoleByIdQuery`

### Settings
- `GetAllSystemSettingsQuery`
- `GetSystemSettingsByGroupQuery`

### Signatures
- `GetVisitSignatureQuery`
- `GetWorkOrderSignaturesQuery`

### Sites
- `GetSiteLocationQuery`
- `GetSitesByComplexityQuery`
- `GetSitesByEngineerQuery`
- `GetSitesByRegionQuery`
- `GetUnassignedSitesQuery`

### Sync
- `GetSyncConflictsQuery`
- `GetSyncStatusQuery`

### Users
- `GetUserByIdQuery`
- `GetUserPerformanceQuery`
- `GetUsersByOfficeQuery`
- `GetUsersByRoleQuery`
- `GetUsersBySpecializationQuery`

### Visits
- `GetEngineerVisitsQuery`
- `GetOfficeSitesQuery`
- `GetOverdueVisitsQuery`
- `GetPendingReviewsQuery`
- `GetScheduledVisitsQuery`
- `GetSiteByIdQuery`
- `GetSitesNeedingMaintenanceQuery`
- `GetVisitByIdQuery`
- `GetVisitEvidenceStatusQuery`
- `GetVisitsByDateRangeQuery`
- `GetVisitsByStatusQuery`
- `GetVisitsNeedingCorrectionQuery`

### WorkOrders
- `GetWorkOrderByIdQuery`

## Notes
- This inventory is intentionally class-name based (contract discoverability).
- Runtime behavior, authorization, and payload contracts remain documented in:
  - `docs/Api-Doc.md`
  - `docs/Application-Doc.md`
  - `docs/Frontend-Reporting-API-Contract-and-Git-Plan.md`

