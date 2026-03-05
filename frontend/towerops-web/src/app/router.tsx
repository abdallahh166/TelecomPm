import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { RequireAuth } from "../core/auth/RequireAuth";
import { RequirePermission } from "../core/auth/RequirePermission";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AdminLayoutPage } from "../pages/admin/AdminLayoutPage";
import { OfficesAdminPage } from "../pages/admin/OfficesAdminPage";
import { UsersAdminPage } from "../pages/admin/UsersAdminPage";
import { RolesAdminPage } from "../pages/admin/RolesAdminPage";
import { SettingsAdminPage } from "../pages/admin/SettingsAdminPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="admin" element={<AdminLayoutPage />}>
            <Route index element={<Navigate to="offices" replace />} />
            <Route
              path="offices"
              element={(
                <RequirePermission permission="offices.manage">
                  <OfficesAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="users"
              element={(
                <RequirePermission permission="users.view">
                  <UsersAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="roles"
              element={(
                <RequirePermission permission="settings.edit">
                  <RolesAdminPage />
                </RequirePermission>
              )}
            />
            <Route
              path="settings"
              element={(
                <RequirePermission permission="settings.edit">
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
