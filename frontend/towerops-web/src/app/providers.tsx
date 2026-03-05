import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../core/auth/AuthContext";
import { AppRouter } from "./router";
import { ErrorCenterProvider } from "../shared/errors/ErrorCenter";
import { ErrorBanner } from "../shared/errors/ErrorBanner";

export function AppProviders() {
  return (
    <BrowserRouter>
      <ErrorCenterProvider>
        <AuthProvider>
          <ErrorBanner />
          <AppRouter />
        </AuthProvider>
      </ErrorCenterProvider>
    </BrowserRouter>
  );
}
