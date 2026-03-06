import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { Button } from "../components/Button/Button";
import { initI18n, t } from "../i18n";

initI18n();

export function AppShell() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen grid grid-rows-[auto_auto_1fr] bg-d-bg text-d-text font-sans">
      <header className="px-4 py-3 border-b border-d-border bg-navy/90 backdrop-blur-sm flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display font-black text-3xl tracking-tight">
            Tower<span className="text-blue">Ops</span>
          </h1>
          <p className="text-xs text-d-muted font-mono">{t("app.tagline")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm border border-d-border rounded-lg px-2.5 py-1.5 bg-d-surface2/80">
            <div>{session?.email}</div>
            <div className="text-d-muted text-xs">{session?.role}</div>
          </div>
          <Button variant="outline" onClick={() => void logout()}>
            {t("nav.logout")}
          </Button>
        </div>
      </header>
      <nav className="px-4 border-b border-d-border bg-navy/70 flex gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `font-mono text-xs px-3 py-3 border-b-2 transition-colors ${
              isActive
                ? "text-blue border-blue"
                : "text-d-muted border-transparent hover:text-d-text"
            }`
          }
        >
          {t("nav.dashboard")}
        </NavLink>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
