import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { t } from "../../i18n";

export function DashboardPage() {
  const { session } = useAuth();
  const permissions = session?.permissions ?? [];

  return (
    <section className="space-y-6">
      <div className="panel relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.12),transparent_65%)] lg:block" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-blue/20 bg-blue/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[1.8px] text-blue">
              {t("app.title")}
            </span>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("nav.dashboard")}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-d-muted sm:text-[15px]">
                {t("dashboard.phase1.authenticatedPrefix")} {session?.role ?? "-"}.
                {" "}
                {t("dashboard.phase1.authenticatedSuffix")}
              </p>
            </div>
          </div>

          <Link
            to="/change-password"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue px-4 py-2.5 font-display text-sm font-bold tracking-[0.2px] text-navy shadow-[0_10px_24px_rgba(0,194,255,0.18)] transition hover:brightness-95"
          >
            {t("auth.change.title")}
          </Link>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-box">
          <strong>{session?.role ?? "-"}</strong>
          <span>{t("dashboard.card.role")}</span>
        </div>
        <div className="metric-box">
          <strong>{permissions.length}</strong>
          <span>{t("dashboard.card.permissions")}</span>
        </div>
        <div className="metric-box">
          <strong className="truncate">{session?.officeId ?? "-"}</strong>
          <span>{t("dashboard.card.officeId")}</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="panel">
          <div className="space-y-1">
            <h3>{t("dashboard.card.permissions")}</h3>
            <p className="text-muted">
              Route access and action visibility are driven by the active permission claims in this session.
            </p>
          </div>

          {permissions.length ? (
            <div className="list-mono">
              {permissions.map((permission) => (
                <code key={permission}>{permission}</code>
              ))}
            </div>
          ) : (
            <div className="alert mt-4 border-d-border bg-d-surface2/80 text-d-muted">
              No permissions found in token.
            </div>
          )}
        </div>

        <div className="panel">
          <div className="space-y-1">
            <h3>{t("app.title")}</h3>
            <p className="text-muted">Current authenticated session details.</p>
          </div>

          <dl className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-d-border bg-d-surface2/80 p-4">
              <dt className="font-mono text-[11px] uppercase tracking-[1.6px] text-d-muted">Email</dt>
              <dd className="mt-2 break-all text-sm text-d-text">{session?.email ?? "-"}</dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-d-border bg-d-surface2/80 p-4">
                <dt className="font-mono text-[11px] uppercase tracking-[1.6px] text-d-muted">
                  {t("dashboard.card.role")}
                </dt>
                <dd className="mt-2 text-sm text-d-text">{session?.role ?? "-"}</dd>
              </div>
              <div className="rounded-2xl border border-d-border bg-d-surface2/80 p-4">
                <dt className="font-mono text-[11px] uppercase tracking-[1.6px] text-d-muted">
                  {t("dashboard.card.officeId")}
                </dt>
                <dd className="mt-2 break-all text-sm text-d-text">{session?.officeId ?? "-"}</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
