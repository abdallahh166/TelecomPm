import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RequireAnyPermissionProps = {
  permissions: readonly string[];
  children: React.ReactNode;
};

export function RequireAnyPermission({
  permissions,
  children,
}: RequireAnyPermissionProps) {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const isAllowed = permissions.some((permission) => hasPermission(permission));
  if (!isAllowed) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  return <>{children}</>;
}
