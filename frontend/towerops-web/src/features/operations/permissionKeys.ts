export const OperationsPermissionKeys = {
  sitesView: "sites.view",
  sitesManage: "sites.edit",
  materialsView: "materials.view",
  materialsManage: "materials.manage",
  visitsView: "visits.view",
  visitsManage: "visits.create",
  visitsReview: "visits.review",
  workOrdersView: "workorders.view",
  workOrdersManage: "workorders.create",
  escalationsView: "escalations.view",
  escalationsCreate: "escalations.create",
  escalationsManage: "escalations.manage",
  kpiView: "kpi.view",
} as const;

export const OPERATIONS_WORKSPACE_PERMISSIONS = [
  OperationsPermissionKeys.sitesView,
  OperationsPermissionKeys.sitesManage,
  OperationsPermissionKeys.materialsView,
  OperationsPermissionKeys.materialsManage,
  OperationsPermissionKeys.visitsView,
  OperationsPermissionKeys.workOrdersView,
  OperationsPermissionKeys.escalationsView,
  OperationsPermissionKeys.escalationsCreate,
  OperationsPermissionKeys.escalationsManage,
  OperationsPermissionKeys.kpiView,
] as const;
