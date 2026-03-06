import { Route, Routes, Navigate } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { PublicLayout } from "../layouts/PublicLayout";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { ChangePasswordPage } from "../features/auth/pages/ChangePasswordPage";
import { DashboardPage } from "./pages/DashboardPage";

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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
