import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiRequestError } from "../core/http/apiError";
import { useAuth } from "../features/auth/context/AuthContext";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const state = location.state as LocationState | null;
  const destination = state?.from?.pathname && state.from.pathname !== "/login"
    ? state.from.pathname
    : "/";

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await login({
        email: email.trim(),
        password,
        mfaCode: mfaCode.trim() || undefined,
      });
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFormError(error.apiError.message);
      } else {
        setFormError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="public-layout">
      <section className="login-card">
        <aside className="login-hero">
          <div>
            <div className="eyebrow">Operations Platform</div>
            <div className="wordmark">
              Tower<span>Ops</span>
            </div>
            <p className="hero-tagline">
              Operational control for PM/CM telecom execution, evidence quality, and SLA performance.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="hero-metric">
              <strong>PM</strong>
              <span>Preventive</span>
            </div>
            <div className="hero-metric">
              <strong>CM</strong>
              <span>Corrective</span>
            </div>
            <div className="hero-metric">
              <strong>SLA</strong>
              <span>Control</span>
            </div>
          </div>
        </aside>
        <form className="login-form" onSubmit={submit}>
          <h1>Sign In</h1>
          <p className="text-muted">
            Use your TowerOps account. MFA code is optional unless enforced.
          </p>

          <label className="field-label" htmlFor="email">
            Email
            <input
              id="email"
              className="field-input"
              name="email"
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field-label" htmlFor="password">
            Password
            <input
              id="password"
              className="field-input"
              name="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="field-label" htmlFor="mfa-code">
            MFA Code (optional)
            <input
              id="mfa-code"
              className="field-input"
              name="mfaCode"
              autoComplete="one-time-code"
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
            />
          </label>

          {formError ? <p className="text-danger">{formError}</p> : null}

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-muted">Need help? Contact your system administrator.</p>
        </form>
      </section>
    </div>
  );
}

