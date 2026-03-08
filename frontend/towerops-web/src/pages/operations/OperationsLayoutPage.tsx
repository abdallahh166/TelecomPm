import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { PageIntro } from "../../components/PageIntro/PageIntro";

export function OperationsLayoutPage() {
  const { hasPermission } = useAuth();
  const hasEscalationAccess =
    hasPermission(OperationsPermissionKeys.escalationsView) ||
    hasPermission(OperationsPermissionKeys.escalationsCreate) ||
    hasPermission(OperationsPermissionKeys.escalationsManage);

  const tabs = [
    {
      to: "sites",
      label: "Sites",
      isVisible: hasPermission(OperationsPermissionKeys.sitesView),
    },
    {
      to: "assets",
      label: "Assets",
      isVisible: hasPermission(OperationsPermissionKeys.sitesView),
    },
    {
      to: "materials",
      label: "Materials",
      isVisible: hasPermission(OperationsPermissionKeys.materialsView),
    },
    {
      to: "visits",
      label: "Visits",
      isVisible: hasPermission(OperationsPermissionKeys.visitsView),
    },
    {
      to: "work-orders",
      label: "Work Orders",
      isVisible: hasPermission(OperationsPermissionKeys.workOrdersView),
    },
    {
      to: "escalations",
      label: "Escalations",
      isVisible: hasEscalationAccess,
    },
    {
      to: "daily-plans",
      label: "Daily Plans",
      isVisible: hasPermission(OperationsPermissionKeys.sitesManage),
    },
  ].filter((tab) => tab.isVisible);

  return (
    <section className="page">
      <PageIntro
        eyebrow="Phases 3-5"
        title="Operations Workspace"
        description="Manage sites, assets, materials, visits, work orders, escalations, and daily planning from one operational control surface."
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

