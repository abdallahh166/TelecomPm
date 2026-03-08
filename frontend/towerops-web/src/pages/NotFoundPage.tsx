import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="screen-center">
      <section className="panel" style={{ maxWidth: "560px" }}>
        <h2>Page Not Found</h2>
        <p className="text-muted">
          The requested route does not exist in this frontend release.
        </p>
        <p>
          <Link to="/">Go to dashboard</Link>
        </p>
      </section>
    </div>
  );
}
