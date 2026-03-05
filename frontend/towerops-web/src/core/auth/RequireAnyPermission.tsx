import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type RequireAnyPermissionProps = {
  permissions: readonly string[];
  children: ReactNode;
};

export function RequireAnyPermission({
  permissions,
  children,
}: RequireAnyPermissionProps) {
  const { hasPermission } = useAuth();
  const hasAccess = permissions.some((permission) => hasPermission(permission));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
