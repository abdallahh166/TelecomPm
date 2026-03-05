import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { AdminPermissionKeys } from "../../features/admin/permissionKeys";

export function AdminLayoutPage() {
  const { hasPermission } = useAuth();

  const tabs = [
    {
      to: "offices",
      label: "Offices",
      isVisible: hasPermission(AdminPermissionKeys.officesManage),
    },
    {
      to: "users",
      label: "Users",
      isVisible: hasPermission(AdminPermissionKeys.usersView),
    },
    {
      to: "roles",
      label: "Roles",
      isVisible: hasPermission(AdminPermissionKeys.settingsEdit),
    },
    {
      to: "settings",
      label: "Settings",
      isVisible: hasPermission(AdminPermissionKeys.settingsEdit),
    },
  ].filter((tab) => tab.isVisible);

  return (
    <section className="page">
      <div>
        <h2>Admin Workspace</h2>
        <p className="text-muted">
          Phase 2 implementation for Offices, Users, Roles, and Settings.
        </p>
      </div>
      <nav className="admin-tabs">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </section>
  );
}
