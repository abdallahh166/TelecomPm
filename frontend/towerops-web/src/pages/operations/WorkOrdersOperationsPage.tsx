import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { officesApi, type OfficeDto } from "../../features/admin/officesApi";
import { usersApi, type UserDto } from "../../features/admin/usersApi";
import {
  workOrdersApi,
  type WorkOrderDto,
  type CreateWorkOrderRequest,
  type AssignWorkOrderRequest,
} from "../../features/operations/workOrdersApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function WorkOrdersOperationsPage() {
  const { session, hasPermission } = useAuth();
  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [engineers, setEngineers] = useState<UserDto[]>([]);
  const [workOrder, setWorkOrder] = useState<WorkOrderDto | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const [createForm, setCreateForm] = useState<CreateWorkOrderRequest>({
    woNumber: "",
    siteCode: "",
    officeCode: "",
    workOrderType: "CM",
    slaClass: "P2",
    scope: "ClientEquipment",
    issueDescription: "",
  });

  const [assignForm, setAssignForm] = useState<AssignWorkOrderRequest>({
    engineerId: "",
    engineerName: "",
    assignedBy: session?.email ?? "",
  });

  const canView = hasPermission(OperationsPermissionKeys.workOrdersView);
  const canManage = hasPermission(OperationsPermissionKeys.workOrdersManage);

  const loadOffices = useCallback(async () => {
    try {
      const result = await officesApi.list({ pageSize: 100, onlyActive: true });
      setOffices(result.items);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  const loadEngineers = useCallback(async () => {
    try {
      const result = await usersApi.listByRole("PMEngineer", { pageSize: 100 });
      setEngineers(result.items);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void loadOffices();
    void loadEngineers();
  }, [loadOffices, loadEngineers]);

  const onLookup = useCallback(async () => {
    const id = lookupId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setWorkOrder(null);
    try {
      const data = await workOrdersApi.getById(id);
      setWorkOrder(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [lookupId]);

  const onCreate = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canManage) return;
      setActionBusy(true);
      setError(null);
      try {
        const created = await workOrdersApi.create(createForm);
        setWorkOrder(created);
        setLookupId(created.id);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setActionBusy(false);
      }
    },
    [canManage, createForm],
  );

  const runAction = useCallback(
    async (fn: () => Promise<void>) => {
      if (!workOrder) return;
      setActionBusy(true);
      setError(null);
      try {
        await fn();
        const updated = await workOrdersApi.getById(workOrder.id);
        setWorkOrder(updated);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setActionBusy(false);
      }
    },
    [workOrder],
  );

  const onAssign = useCallback(() => {
    if (!workOrder) return;
    const engineer = engineers.find((e) => e.id === assignForm.engineerId);
    void runAction(() =>
      workOrdersApi.assign(workOrder.id, {
        ...assignForm,
        engineerName: engineer?.name ?? assignForm.engineerName,
      }),
    );
  }, [workOrder, assignForm, engineers, runAction]);

  if (!canView && !canManage) {
    return (
      <section className="page">
        <p className="text-muted">You do not have permission to view or manage work orders.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Work Orders</h2>
      <p className="text-muted">
        Look up a work order by ID or create a new one. Assign and update lifecycle from the detail below.
      </p>

      {error && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <article className="panel" style={{ marginBottom: "1.5rem" }}>
        <h3>Lookup by ID</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Work order ID (GUID)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={onLookup}
            disabled={loading || !lookupId.trim()}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </article>

      {canManage && (
        <article className="panel" style={{ marginBottom: "1.5rem" }}>
          <h3>Create work order</h3>
          <form onSubmit={onCreate}>
            <div className="form-row">
              <label>
                WO Number
                <input
                  value={createForm.woNumber}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, woNumber: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Site code
                <input
                  value={createForm.siteCode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, siteCode: e.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Office code
                <select
                  value={createForm.officeCode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, officeCode: e.target.value }))
                  }
                  required
                >
                  <option value="">Select office</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.code}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select
                  value={createForm.workOrderType}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, workOrderType: e.target.value }))
                  }
                >
                  <option value="CM">CM</option>
                  <option value="PM">PM</option>
                </select>
              </label>
              <label>
                SLA class
                <select
                  value={createForm.slaClass}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, slaClass: e.target.value }))
                  }
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                  <option value="P3">P3</option>
                  <option value="P4">P4</option>
                </select>
              </label>
              <label>
                Scope
                <select
                  value={createForm.scope}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, scope: e.target.value }))
                  }
                >
                  <option value="ClientEquipment">Client equipment</option>
                  <option value="TowerInfrastructure">Tower infrastructure</option>
                </select>
              </label>
            </div>
            <label>
              Issue description
              <textarea
                value={createForm.issueDescription}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, issueDescription: e.target.value }))
                }
                rows={2}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={actionBusy}>
              Create work order
            </button>
          </form>
        </article>
      )}

      {workOrder && (
        <article className="panel">
          <h3>{workOrder.woNumber}</h3>
          <p className="text-muted">
            {workOrder.siteCode} - {workOrder.officeCode} - {workOrder.status} - {workOrder.slaClass}
          </p>
          <dl className="data-list">
            <dt>Response deadline</dt>
            <dd>{formatDate(workOrder.responseDeadlineUtc)}</dd>
            <dt>Resolution deadline</dt>
            <dd>{formatDate(workOrder.resolutionDeadlineUtc)}</dd>
            <dt>Assigned engineer</dt>
            <dd>{workOrder.assignedEngineerName ?? "-"}</dd>
            <dt>Issue</dt>
            <dd>{workOrder.issueDescription || "-"}</dd>
          </dl>

          {canManage && (
            <>
              {!workOrder.assignedEngineerId && (
                <div className="form-row" style={{ marginTop: "1rem" }}>
                  <label>
                    Assign to engineer
                    <select
                      value={assignForm.engineerId}
                      onChange={(e) => {
                        const u = engineers.find((x) => x.id === e.target.value);
                        setAssignForm((prev) => ({
                          ...prev,
                          engineerId: e.target.value,
                          engineerName: u?.name ?? "",
                        }));
                      }}
                    >
                      <option value="">Select</option>
                      {engineers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={onAssign}
                    disabled={actionBusy || !assignForm.engineerId}
                  >
                    Assign
                  </button>
                </div>
              )}
              <div className="form-row" style={{ gap: "0.5rem", marginTop: "1rem" }}>
                {workOrder.status === "Created" && (
                  <button type="button" className="btn-outline" disabled>
                    (Assign first)
                  </button>
                )}
                {workOrder.status === "Assigned" && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => runAction(() => workOrdersApi.start(workOrder.id))}
                    disabled={actionBusy}
                  >
                    Start
                  </button>
                )}
                {workOrder.status === "InProgress" && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => runAction(() => workOrdersApi.complete(workOrder.id))}
                    disabled={actionBusy}
                  >
                    Complete
                  </button>
                )}
                {(workOrder.status === "PendingInternalReview" ||
                  workOrder.status === "InProgress") && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() =>
                      runAction(() => workOrdersApi.submitForAcceptance(workOrder.id))
                    }
                    disabled={actionBusy}
                  >
                    Submit for acceptance
                  </button>
                )}
                {workOrder.status === "PendingCustomerAcceptance" && (
                  <>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        runAction(() =>
                          workOrdersApi.customerAccept(workOrder.id, {
                            acceptedBy: session?.email ?? "User",
                          }),
                        )
                      }
                      disabled={actionBusy}
                    >
                      Customer accept
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        runAction(() =>
                          workOrdersApi.customerReject(workOrder.id, { reason: "Rejected from UI" }),
                        )
                      }
                      disabled={actionBusy}
                    >
                      Customer reject
                    </button>
                  </>
                )}
                {!["Closed", "Cancelled", "Rejected"].includes(workOrder.status) && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => runAction(() => workOrdersApi.close(workOrder.id))}
                    disabled={actionBusy}
                  >
                    Close
                  </button>
                )}
                {!["Cancelled", "Closed", "Rejected"].includes(workOrder.status) && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => runAction(() => workOrdersApi.cancel(workOrder.id))}
                    disabled={actionBusy}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </article>
      )}
    </section>
  );
}

