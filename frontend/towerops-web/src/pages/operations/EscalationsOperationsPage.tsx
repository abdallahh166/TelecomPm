import { useCallback, useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import {
  ESCALATION_LEVEL_OPTIONS,
  SLA_CLASS_OPTIONS,
  escalationsApi,
  type CreateEscalationRequest,
  type EscalationDto,
} from "../../features/operations/escalationsApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

const EMPTY_CREATE_FORM: CreateEscalationRequest = {
  workOrderId: "",
  incidentId: "",
  siteCode: "",
  slaClass: "P2",
  financialImpactEgp: 0,
  slaImpactPercentage: 0,
  evidencePackage: "",
  previousActions: "",
  recommendedDecision: "",
  level: "AreaManager",
  submittedBy: "",
};

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function EscalationsOperationsPage() {
  const { session, hasPermission } = useAuth();
  const [lookupId, setLookupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [escalation, setEscalation] = useState<EscalationDto | null>(null);
  const [createForm, setCreateForm] = useState<CreateEscalationRequest>({
    ...EMPTY_CREATE_FORM,
    submittedBy: session?.email ?? "",
  });

  const canView = hasPermission(OperationsPermissionKeys.escalationsView);
  const canCreate = hasPermission(OperationsPermissionKeys.escalationsCreate);
  const canManage = hasPermission(OperationsPermissionKeys.escalationsManage);
  const canAccess = canView || canCreate || canManage;

  const loadEscalation = useCallback(async () => {
    const id = lookupId.trim();
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await escalationsApi.getById(id);
      setEscalation(data);
    } catch (e) {
      setEscalation(null);
      setError(getErrorMessage(e, "Failed to load escalation."));
    } finally {
      setLoading(false);
    }
  }, [lookupId]);

  const onCreate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canCreate) {
        return;
      }

      setActionBusy(true);
      setError(null);
      setMessage(null);
      try {
        const created = await escalationsApi.create({
          ...createForm,
          submittedBy: createForm.submittedBy.trim() || session?.email || "Unknown",
        });
        setEscalation(created);
        setLookupId(created.id);
        setMessage("Escalation created successfully.");
      } catch (e) {
        setError(getErrorMessage(e, "Failed to create escalation."));
      } finally {
        setActionBusy(false);
      }
    },
    [canCreate, createForm, session?.email],
  );

  const runTransition = useCallback(
    async (handler: (id: string) => Promise<EscalationDto>, successMessage: string) => {
      if (!escalation || !canManage) {
        return;
      }

      setActionBusy(true);
      setError(null);
      setMessage(null);
      try {
        const updated = await handler(escalation.id);
        setEscalation(updated);
        setMessage(successMessage);
      } catch (e) {
        setError(getErrorMessage(e, "Failed to update escalation."));
      } finally {
        setActionBusy(false);
      }
    },
    [canManage, escalation],
  );

  if (!canAccess) {
    return (
      <section className="page">
        <p className="text-muted">You do not have permission to access escalations.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Escalations</h2>
      <p className="text-muted">
        Create, inspect, and transition escalation records linked to work orders.
      </p>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="inline-notice inline-notice--success" role="status">
          <strong>Done</strong>
          <p>{message}</p>
        </div>
      )}

      <article className="panel">
        <h3>Lookup escalation</h3>
        <div className="form-row">
          <label>
            Escalation ID
            <input
              type="text"
              value={lookupId}
              onChange={(event) => setLookupId(event.target.value)}
              placeholder="Escalation GUID"
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void loadEscalation()}
            disabled={loading || !lookupId.trim()}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </article>

      {canCreate && (
        <article className="panel">
          <h3>Create escalation</h3>
          <form onSubmit={(event) => void onCreate(event)}>
            <div className="form-row">
              <label>
                Work order ID
                <input
                  value={createForm.workOrderId}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, workOrderId: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Incident ID
                <input
                  value={createForm.incidentId}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, incidentId: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Site code
                <input
                  value={createForm.siteCode}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, siteCode: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                SLA class
                <select
                  value={createForm.slaClass}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, slaClass: event.target.value as CreateEscalationRequest["slaClass"] }))
                  }
                >
                  {SLA_CLASS_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Escalation level
                <select
                  value={createForm.level}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, level: event.target.value as CreateEscalationRequest["level"] }))
                  }
                >
                  {ESCALATION_LEVEL_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Submitted by
                <input
                  value={createForm.submittedBy}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, submittedBy: event.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Financial impact (EGP)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={createForm.financialImpactEgp}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      financialImpactEgp: Number(event.target.value || 0),
                    }))
                  }
                />
              </label>
              <label>
                SLA impact (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={createForm.slaImpactPercentage}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      slaImpactPercentage: Number(event.target.value || 0),
                    }))
                  }
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Evidence package
                <textarea
                  rows={3}
                  value={createForm.evidencePackage}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, evidencePackage: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Previous actions
                <textarea
                  rows={3}
                  value={createForm.previousActions}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, previousActions: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Recommended decision
                <textarea
                  rows={2}
                  value={createForm.recommendedDecision}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      recommendedDecision: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={actionBusy}>
              Create escalation
            </button>
          </form>
        </article>
      )}

      {escalation && (
        <article className="panel">
          <h3>Escalation detail</h3>
          <p className="text-muted">
            {escalation.incidentId} | {escalation.status} | {escalation.level}
          </p>
          <dl className="data-list">
            <dt>Escalation ID</dt>
            <dd>{escalation.id}</dd>
            <dt>Work order ID</dt>
            <dd>{escalation.workOrderId}</dd>
            <dt>Site code</dt>
            <dd>{escalation.siteCode}</dd>
            <dt>SLA class</dt>
            <dd>{escalation.slaClass}</dd>
            <dt>Financial impact</dt>
            <dd>{escalation.financialImpactEgp}</dd>
            <dt>SLA impact %</dt>
            <dd>{escalation.slaImpactPercentage}</dd>
            <dt>Submitted by</dt>
            <dd>{escalation.submittedBy}</dd>
            <dt>Submitted at</dt>
            <dd>{formatDateTime(escalation.submittedAtUtc)}</dd>
            <dt>Previous actions</dt>
            <dd>{escalation.previousActions}</dd>
            <dt>Recommended decision</dt>
            <dd>{escalation.recommendedDecision}</dd>
          </dl>

          {canManage && (
            <div className="form-row" style={{ marginTop: "1rem", gap: "0.5rem" }}>
              {escalation.status === "Submitted" && (
                <button
                  type="button"
                  className="btn-outline"
                  disabled={actionBusy}
                  onClick={() => void runTransition(escalationsApi.review, "Escalation moved to review.")}
                >
                  Review
                </button>
              )}
              {escalation.status === "UnderReview" && (
                <>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={actionBusy}
                    onClick={() => void runTransition(escalationsApi.approve, "Escalation approved.")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-outline danger"
                    disabled={actionBusy}
                    onClick={() => void runTransition(escalationsApi.reject, "Escalation rejected.")}
                  >
                    Reject
                  </button>
                </>
              )}
              {escalation.status !== "Closed" && (
                <button
                  type="button"
                  className="btn-outline"
                  disabled={actionBusy}
                  onClick={() => void runTransition(escalationsApi.close, "Escalation closed.")}
                >
                  Close
                </button>
              )}
            </div>
          )}
        </article>
      )}
    </section>
  );
}

