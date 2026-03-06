import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ADMIN_WORKSPACE_PERMISSIONS, hasAnyPermission } from "../../features/admin/permissionKeys";
import { OPERATIONS_WORKSPACE_PERMISSIONS } from "../../features/operations/permissionKeys";

export function AppShell() {
  const { session, logout, hasPermission } = useAuth();
  const showAdminNav = hasAnyPermission(hasPermission, ADMIN_WORKSPACE_PERMISSIONS);
  const showOperationsNav = hasAnyPermission(hasPermission, OPERATIONS_WORKSPACE_PERMISSIONS);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <h1 className="brand-title">
            Tower<span>Ops</span>
          </h1>
          <p className="brand-subtitle">
            PM/CM Operations Control for Telecom Subcontractors
          </p>
        </div>
        <div className="user-pill">
          <div className="user-pill__meta">
            <div>{session?.email}</div>
            <div className="text-muted">{session?.role}</div>
          </div>
          <button className="btn-outline" type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </header>
      <nav className="app-nav">
        <NavLink to="/">Dashboard</NavLink>
        {showAdminNav ? <NavLink to="/admin">Admin</NavLink> : null}
        {showOperationsNav ? <NavLink to="/operations">Operations</NavLink> : null}
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

