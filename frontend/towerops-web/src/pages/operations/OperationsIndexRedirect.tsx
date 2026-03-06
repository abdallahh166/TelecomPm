import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";

export function OperationsIndexRedirect() {
  const { hasPermission } = useAuth();

  if (hasPermission(OperationsPermissionKeys.sitesView)) {
    return <Navigate to="sites" replace />;
  }

  if (hasPermission(OperationsPermissionKeys.materialsView)) {
    return <Navigate to="materials" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
}

