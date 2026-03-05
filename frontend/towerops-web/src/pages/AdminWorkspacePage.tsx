export function AdminWorkspacePage() {
  return (
    <section className="page">
      <div>
        <h2>Admin Probe</h2>
        <p className="text-muted">
          This route is protected by `users.view` permission to validate role-based
          guard wiring.
        </p>
      </div>
      <article className="panel">
        <p>
          Phase 2 implementation will replace this probe with Offices, Users, Roles,
          and Settings workspaces.
        </p>
      </article>
    </section>
  );
}
