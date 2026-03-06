import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { Button } from "../components/Button/Button";
import { initI18n, t } from "../i18n";
import { ADMIN_WORKSPACE_PERMISSIONS, hasAnyPermission } from "../features/admin/permissionKeys";
import { OPERATIONS_WORKSPACE_PERMISSIONS } from "../features/operations/permissionKeys";

initI18n();

export function AppShell() {
  const { session, logout, hasPermission } = useAuth();
  const showAdminNav = hasAnyPermission(hasPermission, ADMIN_WORKSPACE_PERMISSIONS);
  const showOperationsNav = hasAnyPermission(hasPermission, OPERATIONS_WORKSPACE_PERMISSIONS);

  return (
    <div className="min-h-screen bg-d-bg text-d-text font-sans">
      <header className="sticky top-0 z-40 border-b border-d-border bg-navy/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              Tower<span className="text-blue">Ops</span>
            </h1>
            <p className="max-w-[42rem] font-mono text-[11px] uppercase tracking-[1.4px] text-d-muted">
              {t("app.tagline")}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-d-border bg-d-surface2/80 px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="truncate">{session?.email}</div>
              <div className="text-xs text-d-muted">{session?.role}</div>
            </div>
            <Button variant="outline" onClick={() => void logout()}>
              {t("nav.logout")}
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                  isActive
                    ? "border-blue/30 bg-blue/10 text-blue"
                    : "border-d-border bg-d-surface2 text-d-muted hover:text-d-text"
                }`
              }
            >
              {t("nav.dashboard")}
            </NavLink>
            {showAdminNav ? (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                    isActive
                      ? "border-blue/30 bg-blue/10 text-blue"
                      : "border-d-border bg-d-surface2 text-d-muted hover:text-d-text"
                  }`
                }
              >
                {t("nav.admin")}
              </NavLink>
            ) : null}
            {showOperationsNav ? (
              <NavLink
                to="/operations"
                className={({ isActive }) =>
                  `inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                    isActive
                      ? "border-blue/30 bg-blue/10 text-blue"
                      : "border-d-border bg-d-surface2 text-d-muted hover:text-d-text"
                  }`
                }
              >
                {t("nav.operations")}
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
