export const OperationsPermissionKeys = {
  sitesView: "sites.view",
  sitesManage: "sites.edit",
  materialsView: "materials.view",
  materialsManage: "materials.manage",
} as const;

export const OPERATIONS_WORKSPACE_PERMISSIONS = [
  OperationsPermissionKeys.sitesView,
  OperationsPermissionKeys.sitesManage,
  OperationsPermissionKeys.materialsView,
  OperationsPermissionKeys.materialsManage,
] as const;
