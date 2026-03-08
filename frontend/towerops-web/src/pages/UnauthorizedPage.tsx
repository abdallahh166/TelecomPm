import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="screen-center">
      <section className="panel" style={{ maxWidth: "560px" }}>
        <h2>Unauthorized</h2>
        <p className="text-muted">
          Your account is authenticated but does not have permission for this
          resource.
        </p>
        <p>
          <Link to="/">Back to dashboard</Link>
        </p>
      </section>
    </div>
  );
}
