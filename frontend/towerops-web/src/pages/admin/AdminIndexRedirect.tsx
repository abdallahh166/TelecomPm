import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  AdminPermissionKeys,
  hasAnyPermission,
  USER_MANAGEMENT_PERMISSIONS,
} from "../../features/admin/permissionKeys";

export function AdminIndexRedirect() {
  const { hasPermission } = useAuth();

  if (hasPermission(AdminPermissionKeys.officesManage)) {
    return <Navigate to="offices" replace />;
  }

  if (hasPermission(AdminPermissionKeys.usersView)) {
    return <Navigate to="users" replace />;
  }

  if (hasPermission(AdminPermissionKeys.settingsEdit)) {
    return <Navigate to="settings" replace />;
  }

  if (hasAnyPermission(hasPermission, USER_MANAGEMENT_PERMISSIONS)) {
    return <Navigate to="users" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}

