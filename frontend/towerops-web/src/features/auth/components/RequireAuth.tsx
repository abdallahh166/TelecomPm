import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { t } from "../../../i18n";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-d-bg px-4 py-6 text-d-text sm:px-6">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center">
          <div className="w-full rounded-[24px] border border-d-border bg-d-surface/95 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue/20 bg-blue/10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue/20 border-t-blue" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
              {t("app.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-d-muted">
              Loading your secure workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: location.pathname } }}
      />
    );
  }

  return <>{children}</>;
}
