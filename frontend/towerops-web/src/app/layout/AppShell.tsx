import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";

export function AppShell() {
  const { session, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <h1 className="brand-title">
            Tower<span>Ops</span>
          </h1>
          <p className="brand-subtitle">
            PM/CM Operations Control for Telecom Subcontractors
          </p>
        </div>
        <div className="user-pill">
          <div className="user-pill__meta">
            <div>{session?.email}</div>
            <div className="text-muted">{session?.role}</div>
          </div>
          <button className="btn-outline" type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </header>
      <nav className="app-nav">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/admin/offices">Admin</NavLink>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
