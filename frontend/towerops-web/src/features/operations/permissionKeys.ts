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
  kpiView: "kpi.view",
} as const;

export const OPERATIONS_WORKSPACE_PERMISSIONS = [
  OperationsPermissionKeys.sitesView,
  OperationsPermissionKeys.sitesManage,
  OperationsPermissionKeys.materialsView,
  OperationsPermissionKeys.materialsManage,
  OperationsPermissionKeys.visitsView,
  OperationsPermissionKeys.workOrdersView,
  OperationsPermissionKeys.kpiView,
] as const;
