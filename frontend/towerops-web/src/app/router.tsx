import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { RequireAuth } from "../core/auth/RequireAuth";
import { RequirePermission } from "../core/auth/RequirePermission";
import { RequireAnyPermission } from "../core/auth/RequireAnyPermission";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AdminLayoutPage } from "../pages/admin/AdminLayoutPage";
import { AdminIndexRedirect } from "../pages/admin/AdminIndexRedirect";
import { OfficesAdminPage } from "../pages/admin/OfficesAdminPage";
import { UsersAdminPage } from "../pages/admin/UsersAdminPage";
import { RolesAdminPage } from "../pages/admin/RolesAdminPage";
import { SettingsAdminPage } from "../pages/admin/SettingsAdminPage";
import { ADMIN_WORKSPACE_PERMISSIONS, AdminPermissionKeys } from "../features/admin/permissionKeys";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="admin"
            element={(
              <RequireAnyPermission permissions={ADMIN_WORKSPACE_PERMISSIONS}>
                <AdminLayoutPage />
              </RequireAnyPermission>
            )}
          >
            <Route index element={<AdminIndexRedirect />} />
            <Route
              path="offices"
              element={(
                <RequirePermission permission={AdminPermissionKeys.officesManage}>
                  <OfficesAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="users"
              element={(
                <RequirePermission permission={AdminPermissionKeys.usersView}>
                  <UsersAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="roles"
              element={(
                <RequirePermission permission={AdminPermissionKeys.settingsEdit}>
                  <RolesAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="settings"
              element={(
                <RequirePermission permission={AdminPermissionKeys.settingsEdit}>
                  <SettingsAdminPage />
                </RequirePermission>
              )}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
