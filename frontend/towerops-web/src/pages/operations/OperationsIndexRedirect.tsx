import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";

export function OperationsIndexRedirect() {
  const { hasPermission } = useAuth();
  const hasEscalationAccess =
    hasPermission(OperationsPermissionKeys.escalationsView) ||
    hasPermission(OperationsPermissionKeys.escalationsCreate) ||
    hasPermission(OperationsPermissionKeys.escalationsManage);

  if (hasPermission(OperationsPermissionKeys.sitesView)) {
    return <Navigate to="sites" replace />;
  }

  if (hasPermission(OperationsPermissionKeys.materialsView)) {
    return <Navigate to="materials" replace />;
  }

  if (hasPermission(OperationsPermissionKeys.visitsView)) {
    return <Navigate to="visits" replace />;
  }

  if (hasPermission(OperationsPermissionKeys.workOrdersView)) {
    return <Navigate to="work-orders" replace />;
  }

  if (hasEscalationAccess) {
    return <Navigate to="escalations" replace />;
  }

  if (hasPermission(OperationsPermissionKeys.sitesManage)) {
    return <Navigate to="daily-plans" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}

