export const AdminPermissionKeys = {
  officesManage: "offices.manage",
  usersView: "users.view",
  usersCreate: "users.create",
  usersEdit: "users.edit",
  usersDelete: "users.delete",
  usersChangeRole: "users.change_role",
  settingsEdit: "settings.edit",
} as const;

export const ADMIN_WORKSPACE_PERMISSIONS = [
  AdminPermissionKeys.officesManage,
  AdminPermissionKeys.usersView,
  AdminPermissionKeys.settingsEdit,
] as const;

export const USER_MANAGEMENT_PERMISSIONS = [
  AdminPermissionKeys.usersCreate,
  AdminPermissionKeys.usersEdit,
  AdminPermissionKeys.usersDelete,
  AdminPermissionKeys.usersChangeRole,
] as const;

export function hasAnyPermission(
  hasPermission: (permission: string) => boolean,
  permissions: readonly string[],
): boolean {
  return permissions.some((permission) => hasPermission(permission));
}
