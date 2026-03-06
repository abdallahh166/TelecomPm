import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  visitsApi,
  type VisitDetailDto,
} from "../../features/operations/visitsApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [visit, setVisit] = useState<VisitDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");

  const canReview = hasPermission(OperationsPermissionKeys.visitsReview);

  const load = useCallback(async () => {
    if (!visitId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await visitsApi.getById(visitId);
      setVisit(data);
    } catch (e) {
      setError(getErrorMessage(e));
      setVisit(null);
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = useCallback(
    async (fn: () => Promise<void>) => {
      setActionBusy(true);
      setError(null);
      try {
        await fn();
        await load();
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const handleApprove = useCallback(() => {
    if (!visitId) return;
    void runAction(() =>
      visitsApi.approve(visitId, { reviewerNotes: reviewerNotes || undefined }),
    );
  }, [visitId, reviewerNotes, runAction]);

  const handleReject = useCallback(() => {
    if (!visitId || !reviewerNotes.trim()) {
      setError("Reviewer notes are required to reject.");
      return;
    }
    void runAction(() =>
      visitsApi.reject(visitId, { reviewerNotes: reviewerNotes.trim() }),
    );
  }, [visitId, reviewerNotes, runAction]);

  const handleRequestCorrection = useCallback(() => {
    if (!visitId || !reviewerNotes.trim()) {
      setError("Reviewer notes are required to request correction.");
      return;
    }
    void runAction(() =>
      visitsApi.requestCorrection(visitId, {
        reviewerNotes: reviewerNotes.trim(),
      }),
    );
  }, [visitId, reviewerNotes, runAction]);

  if (!visitId) {
    return (
      <section className="page">
        <p className="text-muted">Missing visit ID.</p>
      </section>
    );
  }

  if (loading && !visit) {
    return (
      <section className="page">
        <p className="text-muted">Loading visit…</p>
      </section>
    );
  }

  if (error && !visit) {
    return (
      <section className="page">
        <div className="alert alert--error" role="alert">
          {error}
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/operations/visits")}
        >
          Back to Visits
        </button>
      </section>
    );
  }

  if (!visit) {
    return null;
  }

  return (
    <section className="page">
      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/operations/visits")}
        >
          ← Back to Visits
        </button>
      </div>

      <h2>{visit.visitNumber}</h2>
      <p className="text-muted">
        {visit.siteName} ({visit.siteCode}) · {visit.status} · {visit.type}
      </p>

      {error && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="metric-grid" style={{ marginBottom: "1.5rem" }}>
        <article className="metric-box">
          <strong>{visit.engineerName}</strong>
          <span>Engineer</span>
        </article>
        <article className="metric-box">
          <strong>{formatDate(visit.scheduledDate)}</strong>
          <span>Scheduled</span>
        </article>
        <article className="metric-box">
          <strong>{visit.completionPercentage}%</strong>
          <span>Completion</span>
        </article>
        <article className="metric-box">
          <strong>{visit.photos.length} / (required)</strong>
          <span>Photos</span>
        </article>
      </div>

      {visit.engineerNotes && (
        <article className="panel" style={{ marginBottom: "1rem" }}>
          <h3>Engineer notes</h3>
          <p>{visit.engineerNotes}</p>
        </article>
      )}

      {canReview &&
        (visit.status === "Submitted" || visit.status === "UnderReview") && (
          <article className="panel" style={{ marginBottom: "1rem" }}>
            <h3>Review actions</h3>
            <label>
              Reviewer notes
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={3}
                placeholder="Required for reject / request correction"
              />
            </label>
            <div className="form-row" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApprove}
                disabled={actionBusy}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleRequestCorrection}
                disabled={actionBusy || !reviewerNotes.trim()}
              >
                Request correction
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={handleReject}
                disabled={actionBusy || !reviewerNotes.trim()}
              >
                Reject
              </button>
            </div>
          </article>
        )}

      {visit.approvalHistory.length > 0 && (
        <article className="panel">
          <h3>Approval history</h3>
          <ul>
            {visit.approvalHistory.map((a) => (
              <li key={a.id}>
                {a.action} by {a.performedBy} at {formatDate(a.performedAtUtc)}
                {a.notes && ` — ${a.notes}`}
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

