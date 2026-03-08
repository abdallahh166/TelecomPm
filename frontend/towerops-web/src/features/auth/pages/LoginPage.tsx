import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "../components/LoginForm";

type LocationState = { from?: { pathname?: string } };

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname && state.from.pathname !== "/login" ? state.from.pathname : "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <LoginForm
      onSubmit={async (email, password, mfaCode) => {
        await login({ email, password, mfaCode });
      }}
    />
  );
}
