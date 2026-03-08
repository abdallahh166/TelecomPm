import { Route, Routes, Navigate } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { PublicLayout } from "../layouts/PublicLayout";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { RequireAnyPermission } from "../features/auth/components/RequireAnyPermission";
import {
  ADMIN_WORKSPACE_PERMISSIONS,
  AdminPermissionKeys,
} from "../features/admin/permissionKeys";
import { OPERATIONS_WORKSPACE_PERMISSIONS } from "../features/operations/permissionKeys";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { ChangePasswordPage } from "../features/auth/pages/ChangePasswordPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { AdminLayoutPage } from "../pages/admin/AdminLayoutPage";
import { AdminIndexRedirect } from "../pages/admin/AdminIndexRedirect";
import { OfficesAdminPage } from "../pages/admin/OfficesAdminPage";
import { UsersAdminPage } from "../pages/admin/UsersAdminPage";
import { RolesAdminPage } from "../pages/admin/RolesAdminPage";
import { SettingsAdminPage } from "../pages/admin/SettingsAdminPage";
import { OperationsLayoutPage } from "../pages/operations/OperationsLayoutPage";
import { OperationsIndexRedirect } from "../pages/operations/OperationsIndexRedirect";
import { SitesOperationsPage } from "../pages/operations/SitesOperationsPage";
import { AssetsOperationsPage } from "../pages/operations/AssetsOperationsPage";
import { MaterialsOperationsPage } from "../pages/operations/MaterialsOperationsPage";
import { VisitsOperationsPage } from "../pages/operations/VisitsOperationsPage";
import { VisitDetailPage } from "../pages/operations/VisitDetailPage";
import { WorkOrdersOperationsPage } from "../pages/operations/WorkOrdersOperationsPage";
import { EscalationsOperationsPage } from "../pages/operations/EscalationsOperationsPage";
import { DailyPlansOperationsPage } from "../pages/operations/DailyPlansOperationsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        <Route
          path="/admin"
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
              <RequireAnyPermission permissions={[AdminPermissionKeys.officesManage]}>
                <OfficesAdminPage />
              </RequireAnyPermission>
            )}
          />
          <Route
            path="users"
            element={(
              <RequireAnyPermission permissions={[AdminPermissionKeys.usersView]}>
                <UsersAdminPage />
              </RequireAnyPermission>
            )}
          />
          <Route
            path="roles"
            element={(
              <RequireAnyPermission permissions={[AdminPermissionKeys.settingsEdit]}>
                <RolesAdminPage />
              </RequireAnyPermission>
            )}
          />
          <Route
            path="settings"
            element={(
              <RequireAnyPermission permissions={[AdminPermissionKeys.settingsEdit]}>
                <SettingsAdminPage />
              </RequireAnyPermission>
            )}
          />
        </Route>

        <Route
          path="/operations"
          element={(
            <RequireAnyPermission permissions={OPERATIONS_WORKSPACE_PERMISSIONS}>
              <OperationsLayoutPage />
            </RequireAnyPermission>
          )}
        >
          <Route index element={<OperationsIndexRedirect />} />
          <Route path="sites" element={<SitesOperationsPage />} />
          <Route path="assets" element={<AssetsOperationsPage />} />
          <Route path="materials" element={<MaterialsOperationsPage />} />
          <Route path="visits" element={<VisitsOperationsPage />} />
          <Route path="visits/:visitId" element={<VisitDetailPage />} />
          <Route path="work-orders" element={<WorkOrdersOperationsPage />} />
          <Route path="escalations" element={<EscalationsOperationsPage />} />
          <Route path="daily-plans" element={<DailyPlansOperationsPage />} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
