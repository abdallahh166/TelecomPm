import { NavLink, Outlet } from "react-router-dom";

export function AdminLayoutPage() {
  return (
    <section className="page">
      <div>
        <h2>Admin Workspace</h2>
        <p className="text-muted">
          Phase 2 implementation for Offices, Users, Roles, and Settings.
        </p>
      </div>
      <nav className="admin-tabs">
        <NavLink to="offices">Offices</NavLink>
        <NavLink to="users">Users</NavLink>
        <NavLink to="roles">Roles</NavLink>
        <NavLink to="settings">Settings</NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
