import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";

export function OperationsLayoutPage() {
  const { hasPermission } = useAuth();

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
  ].filter((tab) => tab.isVisible);

  return (
    <section className="page">
      <div>
        <h2>Operations Workspace</h2>
        <p className="text-muted">
          Sites, assets, materials, visits, and work orders.
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

