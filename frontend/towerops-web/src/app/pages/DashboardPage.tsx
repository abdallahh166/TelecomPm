import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { t } from "../../i18n";

export function DashboardPage() {
  const { session } = useAuth();

  return (
    <section className="space-y-4">
      <h2 className="font-display text-3xl font-bold">{t("nav.dashboard")}</h2>
      <p className="text-d-muted">
        {t("dashboard.phase1.authenticatedPrefix")} {session?.role ?? "-"}.
        {" "}
        {t("dashboard.phase1.authenticatedSuffix")}
      </p>
      <p className="text-sm">
        <Link to="/change-password" className="text-blue hover:underline">
          {t("auth.change.title")}
        </Link>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-d-border bg-d-surface2 p-4">
          <span className="font-display text-2xl text-blue">{session?.role ?? "-"}</span>
          <span className="block font-mono text-xs text-d-muted mt-1">
            {t("dashboard.card.role")}
          </span>
        </div>
        <div className="rounded-lg border border-d-border bg-d-surface2 p-4">
          <span className="font-display text-2xl text-blue">
            {session?.permissions.length ?? 0}
          </span>
          <span className="block font-mono text-xs text-d-muted mt-1">
            {t("dashboard.card.permissions")}
          </span>
        </div>
        <div className="rounded-lg border border-d-border bg-d-surface2 p-4">
          <span className="font-display text-2xl text-blue truncate block">
            {session?.officeId ?? "-"}
          </span>
          <span className="block font-mono text-xs text-d-muted mt-1">
            {t("dashboard.card.officeId")}
          </span>
        </div>
      </div>
    </section>
  );
}
