import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { officesApi, type OfficeDto } from "../../features/admin/officesApi";
import { usersApi, type UserDto } from "../../features/admin/usersApi";
import {
  DAILY_PLAN_VISIT_TYPE_OPTIONS,
  dailyPlansApi,
  type AssignSiteToEngineerRequest,
  type DailyPlanDto,
  type PlannedVisitStopDto,
  type RemoveSiteFromEngineerRequest,
  type UnassignedSiteDto,
} from "../../features/operations/dailyPlansApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

type CreateDailyPlanForm = {
  officeId: string;
  planDate: string;
  officeManagerId: string;
};

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY_CREATE_PLAN_FORM: CreateDailyPlanForm = {
  officeId: "",
  planDate: TODAY,
  officeManagerId: "",
};

const EMPTY_ASSIGN_FORM: AssignSiteToEngineerRequest = {
  engineerId: "",
  siteCode: "",
  visitType: "BM",
  priority: "P3",
};

const EMPTY_REMOVE_FORM: RemoveSiteFromEngineerRequest = {
  engineerId: "",
  siteCode: "",
};

function formatDecimal(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "-";
}

export function DailyPlansOperationsPage() {
  const { session, hasPermission } = useAuth();
  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [engineers, setEngineers] = useState<UserDto[]>([]);
  const [createForm, setCreateForm] = useState<CreateDailyPlanForm>(EMPTY_CREATE_PLAN_FORM);
  const [officeId, setOfficeId] = useState("");
  const [planDate, setPlanDate] = useState(TODAY);
  const [plan, setPlan] = useState<DailyPlanDto | null>(null);
  const [assignForm, setAssignForm] = useState<AssignSiteToEngineerRequest>(EMPTY_ASSIGN_FORM);
  const [removeForm, setRemoveForm] = useState<RemoveSiteFromEngineerRequest>(EMPTY_REMOVE_FORM);
  const [suggestEngineerId, setSuggestEngineerId] = useState("");
  const [suggestedStops, setSuggestedStops] = useState<PlannedVisitStopDto[]>([]);
  const [unassignedSites, setUnassignedSites] = useState<UnassignedSiteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canManage = hasPermission(OperationsPermissionKeys.sitesManage);

  const loadOffices = useCallback(async () => {
    try {
      const response = await officesApi.list({ onlyActive: true, pageSize: 100 });
      setOffices(response.items);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load offices."));
    }
  }, []);

  const loadEngineers = useCallback(async () => {
    try {
      const engineerResponse = await usersApi.listByRole("PMEngineer", { pageSize: 100 });
      const managerResponse = await usersApi.listByRole("Manager", { pageSize: 100 });

      const merged = [...engineerResponse.items, ...managerResponse.items];
      const deduplicated = Array.from(new Map(merged.map((user) => [user.id, user])).values());
      setEngineers(deduplicated);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load engineers."));
    }
  }, []);

  useEffect(() => {
    void loadOffices();
    void loadEngineers();
  }, [loadOffices, loadEngineers]);

  useEffect(() => {
    if (!createForm.officeManagerId && session?.userId) {
      setCreateForm((prev) => ({ ...prev, officeManagerId: session.userId }));
    }
  }, [createForm.officeManagerId, session?.userId]);

  const loadPlan = useCallback(async () => {
    if (!officeId || !planDate) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await dailyPlansApi.getByOfficeAndDate(officeId, planDate);
      setPlan(data);
      setSuggestedStops([]);
    } catch (e) {
      setPlan(null);
      setError(getErrorMessage(e, "Failed to load daily plan."));
    } finally {
      setLoading(false);
    }
  }, [officeId, planDate]);

  const loadUnassigned = useCallback(async () => {
    if (!officeId || !planDate) {
      return;
    }

    setActionBusy(true);
    setError(null);
    try {
      const data = await dailyPlansApi.getUnassignedSites(officeId, planDate);
      setUnassignedSites(data);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load unassigned sites."));
    } finally {
      setActionBusy(false);
    }
  }, [officeId, planDate]);

  const onCreatePlan = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canManage) {
        return;
      }

      setActionBusy(true);
      setError(null);
      setMessage(null);
      try {
        const created = await dailyPlansApi.create(createForm);
        setPlan(created);
        setOfficeId(created.officeId);
        setPlanDate(created.planDate);
        setMessage("Daily plan created.");
      } catch (e) {
        setError(getErrorMessage(e, "Failed to create daily plan."));
      } finally {
        setActionBusy(false);
      }
    },
    [canManage, createForm],
  );

  const onAssignSite = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!plan) {
        return;
      }

      setActionBusy(true);
      setError(null);
      setMessage(null);
      try {
        const updated = await dailyPlansApi.assignSite(plan.id, assignForm);
        setPlan(updated);
        setAssignForm((prev) => ({ ...prev, siteCode: "" }));
        setMessage("Site assigned to engineer.");
      } catch (e) {
        setError(getErrorMessage(e, "Failed to assign site."));
      } finally {
        setActionBusy(false);
      }
    },
    [assignForm, plan],
  );

  const onRemoveSite = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!plan) {
        return;
      }

      setActionBusy(true);
      setError(null);
      setMessage(null);
      try {
        const updated = await dailyPlansApi.removeSite(plan.id, removeForm);
        setPlan(updated);
        setMessage("Site removed from engineer plan.");
      } catch (e) {
        setError(getErrorMessage(e, "Failed to remove site."));
      } finally {
        setActionBusy(false);
      }
    },
    [plan, removeForm],
  );

  const onSuggestOrder = useCallback(async () => {
    if (!plan || !suggestEngineerId) {
      return;
    }

    setActionBusy(true);
    setError(null);
    try {
      const suggested = await dailyPlansApi.suggestOrder(plan.id, suggestEngineerId);
      setSuggestedStops(suggested);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to get suggested order."));
    } finally {
      setActionBusy(false);
    }
  }, [plan, suggestEngineerId]);

  const onPublish = useCallback(async () => {
    if (!plan) {
      return;
    }

    setActionBusy(true);
    setError(null);
    setMessage(null);
    try {
      const published = await dailyPlansApi.publish(plan.id);
      setPlan(published);
      setMessage("Daily plan published.");
    } catch (e) {
      setError(getErrorMessage(e, "Failed to publish daily plan."));
    } finally {
      setActionBusy(false);
    }
  }, [plan]);

  if (!canManage) {
    return (
      <section className="page">
        <p className="text-muted">You do not have permission to manage daily plans.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Daily Plans</h2>
      <p className="text-muted">
        Build office daily plans, assign sites to engineers, validate suggested route order, and publish.
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
        <h3>Create daily plan</h3>
        <form onSubmit={(event) => void onCreatePlan(event)}>
          <div className="form-row">
            <label>
              Office
              <select
                value={createForm.officeId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, officeId: event.target.value }))
                }
                required
              >
                <option value="">Select office</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name} ({office.code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Plan date
              <input
                type="date"
                value={createForm.planDate}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, planDate: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Office manager
              <select
                value={createForm.officeManagerId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, officeManagerId: event.target.value }))
                }
                required
              >
                <option value="">Select manager</option>
                {engineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name} ({engineer.email})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={actionBusy}>
            Create plan
          </button>
        </form>
      </article>

      <article className="panel">
        <h3>Load plan by office and date</h3>
        <div className="form-row">
          <label>
            Office
            <select value={officeId} onChange={(event) => setOfficeId(event.target.value)}>
              <option value="">Select office</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name} ({office.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={planDate} onChange={(event) => setPlanDate(event.target.value)} />
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void loadPlan()}
            disabled={loading || !officeId || !planDate}
          >
            {loading ? "Loading..." : "Load plan"}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => void loadUnassigned()}
            disabled={actionBusy || !officeId || !planDate}
          >
            Load unassigned
          </button>
        </div>
      </article>

      {plan && (
        <>
          <article className="panel">
            <h3>Plan detail</h3>
            <p className="text-muted">
              {plan.planDate} | {plan.status} | Office {plan.officeId}
            </p>
            <dl className="data-list">
              <dt>Plan ID</dt>
              <dd>{plan.id}</dd>
              <dt>Manager ID</dt>
              <dd>{plan.officeManagerId}</dd>
              <dt>Engineer plans</dt>
              <dd>{plan.engineerPlans.length}</dd>
            </dl>
            <div className="form-row" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn-primary" onClick={() => void onPublish()} disabled={actionBusy}>
                Publish
              </button>
            </div>
          </article>

          <article className="panel">
            <h3>Assign site to engineer</h3>
            <form onSubmit={(event) => void onAssignSite(event)}>
              <div className="form-row">
                <label>
                  Engineer
                  <select
                    value={assignForm.engineerId}
                    onChange={(event) =>
                      setAssignForm((prev) => ({ ...prev, engineerId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select engineer</option>
                    {engineers.map((engineer) => (
                      <option key={engineer.id} value={engineer.id}>
                        {engineer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Site code
                  <input
                    value={assignForm.siteCode}
                    onChange={(event) =>
                      setAssignForm((prev) => ({ ...prev, siteCode: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Visit type
                  <select
                    value={assignForm.visitType}
                    onChange={(event) =>
                      setAssignForm((prev) => ({ ...prev, visitType: event.target.value as AssignSiteToEngineerRequest["visitType"] }))
                    }
                  >
                    {DAILY_PLAN_VISIT_TYPE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <input
                    value={assignForm.priority}
                    onChange={(event) =>
                      setAssignForm((prev) => ({ ...prev, priority: event.target.value }))
                    }
                  />
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={actionBusy}>
                Assign
              </button>
            </form>
          </article>

          <article className="panel">
            <h3>Remove site from engineer</h3>
            <form onSubmit={(event) => void onRemoveSite(event)}>
              <div className="form-row">
                <label>
                  Engineer
                  <select
                    value={removeForm.engineerId}
                    onChange={(event) =>
                      setRemoveForm((prev) => ({ ...prev, engineerId: event.target.value }))
                    }
                    required
                  >
                    <option value="">Select engineer</option>
                    {engineers.map((engineer) => (
                      <option key={engineer.id} value={engineer.id}>
                        {engineer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Site code
                  <input
                    value={removeForm.siteCode}
                    onChange={(event) =>
                      setRemoveForm((prev) => ({ ...prev, siteCode: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <button type="submit" className="btn-outline danger" disabled={actionBusy}>
                Remove
              </button>
            </form>
          </article>

          <article className="panel">
            <h3>Suggested route order</h3>
            <div className="form-row">
              <label>
                Engineer
                <select
                  value={suggestEngineerId}
                  onChange={(event) => setSuggestEngineerId(event.target.value)}
                >
                  <option value="">Select engineer</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void onSuggestOrder()}
                disabled={actionBusy || !suggestEngineerId}
              >
                Suggest order
              </button>
            </div>
            {suggestedStops.length > 0 ? (
              <div className="table-wrap" style={{ marginTop: "1rem" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Site</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Distance km</th>
                      <th>Travel min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedStops.map((stop) => (
                      <tr key={`${stop.order}-${stop.siteCode}`}>
                        <td>{stop.order}</td>
                        <td>{stop.siteCode}</td>
                        <td>{stop.visitType}</td>
                        <td>{stop.priority}</td>
                        <td>{formatDecimal(stop.distanceFromPreviousKm)}</td>
                        <td>{stop.estimatedTravelMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No suggested order loaded.</p>
            )}
          </article>

          <article className="panel">
            <h3>Engineer plans</h3>
            {plan.engineerPlans.length === 0 ? (
              <p className="text-muted">No engineer plans assigned yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Engineer ID</th>
                      <th>Stops</th>
                      <th>Total distance km</th>
                      <th>Total travel min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.engineerPlans.map((engineerPlan) => (
                      <tr key={engineerPlan.engineerId}>
                        <td>{engineerPlan.engineerId}</td>
                        <td>{engineerPlan.stops.length}</td>
                        <td>{formatDecimal(engineerPlan.totalEstimatedDistanceKm)}</td>
                        <td>{engineerPlan.totalEstimatedTravelMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      )}

      <article className="panel">
        <h3>Unassigned sites</h3>
        {unassignedSites.length === 0 ? (
          <p className="text-muted">No unassigned sites loaded.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Site code</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {unassignedSites.map((site) => (
                  <tr key={site.siteId}>
                    <td>{site.siteCode}</td>
                    <td>{site.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

