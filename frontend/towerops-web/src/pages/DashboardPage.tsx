import { useAuth } from "../core/auth/AuthContext";

export function DashboardPage() {
  const { session } = useAuth();

  return (
    <section className="page">
      <div>
        <h2>Phase 1 Dashboard</h2>
        <p className="text-muted">
          Authenticated shell is active. Next phases will add module workspaces.
        </p>
      </div>
      <div className="metric-grid">
        <article className="metric-box">
          <strong>{session?.role ?? "-"}</strong>
          <span>Current role</span>
        </article>
        <article className="metric-box">
          <strong>{session?.permissions.length ?? 0}</strong>
          <span>Permission claims</span>
        </article>
        <article className="metric-box">
          <strong>{session?.officeId ?? "-"}</strong>
          <span>Office ID</span>
        </article>
      </div>
      <article className="panel">
        <h3>Permission Snapshot</h3>
        <p className="text-muted">Parsed from JWT `permission` claims.</p>
        <div className="list-mono">
          {session?.permissions.length ? (
            session.permissions.map((permission) => (
              <code key={permission}>{permission}</code>
            ))
          ) : (
            <span className="text-muted">No permissions found in token.</span>
          )}
        </div>
      </article>
    </section>
  );
}
