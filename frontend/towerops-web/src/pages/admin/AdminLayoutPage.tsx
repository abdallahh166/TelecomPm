import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { AdminPermissionKeys } from "../../features/admin/permissionKeys";
import { PageIntro } from "../../components/PageIntro/PageIntro";

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
      <PageIntro
        eyebrow="Phase 2"
        title="Admin Workspace"
        description="Manage master data, access controls, and system settings used by operations and reporting flows."
      />
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

