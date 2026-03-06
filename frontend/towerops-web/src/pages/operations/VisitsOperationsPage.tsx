import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { officesApi, type OfficeDto } from "../../features/admin/officesApi";
import { usersApi, type UserDto } from "../../features/admin/usersApi";
import { PaginationBar } from "../../features/admin/AdminUi";
import { visitsApi, type VisitDto } from "../../features/operations/visitsApi";
import { OperationsPermissionKeys } from "../../features/operations/permissionKeys";
import { getErrorMessage } from "../../shared/errors/errorMessage";

type TabId = "pending" | "scheduled" | "engineer";

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

function StatusBadge({ status }: { status: string }) {
  return <span className="badge badge--neutral">{status}</span>;
}

export function VisitsOperationsPage() {
  const { session, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as TabId) || "pending";

  const [offices, setOffices] = useState<OfficeDto[]>([]);
  const [engineers, setEngineers] = useState<UserDto[]>([]);
  const [visits, setVisits] = useState<VisitDto[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOfficeId = searchParams.get("officeId") ?? "";
  const selectedEngineerId = searchParams.get("engineerId") ?? session?.userId ?? "";
  const scheduledDate = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const canViewVisits = hasPermission(OperationsPermissionKeys.visitsView);

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
      const managers = await usersApi.listByRole("Manager", { pageSize: 100 });
      setEngineers((prev) => [...prev, ...managers.items]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  const loadPendingReviews = useCallback(async () => {
    if (!canViewVisits) return;
    setLoading(true);
    setError(null);
    try {
      const result = await visitsApi.getPendingReviews({
        officeId: selectedOfficeId || undefined,
        page,
        pageSize: 25,
      });
      setVisits(result.items);
      setPagination(result.pagination);
    } catch (e) {
      setError(getErrorMessage(e));
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [canViewVisits, selectedOfficeId, page]);

  const loadScheduled = useCallback(async () => {
    if (!canViewVisits) return;
    setLoading(true);
    setError(null);
    try {
      const result = await visitsApi.getScheduled({
        date: scheduledDate,
        engineerId: selectedEngineerId || undefined,
        page,
        pageSize: 25,
      });
      setVisits(result.items);
      setPagination(result.pagination);
    } catch (e) {
      setError(getErrorMessage(e));
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [canViewVisits, scheduledDate, selectedEngineerId, page]);

  const loadEngineerVisits = useCallback(async () => {
    if (!canViewVisits || !selectedEngineerId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await visitsApi.getEngineerVisits(selectedEngineerId, {
        pageNumber: page,
        pageSize: 25,
      });
      setVisits(result.items);
      setPagination(result.pagination);
    } catch (e) {
      setError(getErrorMessage(e));
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [canViewVisits, selectedEngineerId, page]);

  useEffect(() => {
    void loadOffices();
    void loadEngineers();
  }, [loadOffices, loadEngineers]);

  useEffect(() => {
    if (tab === "pending") void loadPendingReviews();
    else if (tab === "scheduled") void loadScheduled();
    else if (tab === "engineer") void loadEngineerVisits();
  }, [tab, loadPendingReviews, loadScheduled, loadEngineerVisits]);

  const setTab = (t: TabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", t);
      next.delete("page");
      return next;
    });
  };

  if (!canViewVisits) {
    return (
      <section className="page">
        <p className="text-muted">You do not have permission to view visits.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h2>Visits</h2>
      <p className="text-muted">
        Pending reviews, scheduled visits, and engineer visit queue.
      </p>

      <div className="admin-tabs" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className={tab === "pending" ? "active" : ""}
          onClick={() => setTab("pending")}
        >
          Pending reviews
        </button>
        <button
          type="button"
          className={tab === "scheduled" ? "active" : ""}
          onClick={() => setTab("scheduled")}
        >
          Scheduled
        </button>
        <button
          type="button"
          className={tab === "engineer" ? "active" : ""}
          onClick={() => setTab("engineer")}
        >
          Engineer queue
        </button>
      </div>

      {tab === "pending" && (
        <div className="form-row" style={{ marginBottom: "1rem" }}>
          <label>
            Office
            <select
              value={selectedOfficeId}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (e.target.value) next.set("officeId", e.target.value);
                  else next.delete("officeId");
                  next.delete("page");
                  return next;
                });
              }}
            >
              <option value="">All offices</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {tab === "scheduled" && (
        <div className="form-row" style={{ marginBottom: "1rem" }}>
          <label>
            Date
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("date", e.target.value);
                  next.delete("page");
                  return next;
                });
              }}
            />
          </label>
          <label>
            Engineer
            <select
              value={selectedEngineerId}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (e.target.value) next.set("engineerId", e.target.value);
                  else next.delete("engineerId");
                  next.delete("page");
                  return next;
                });
              }}
            >
              <option value="">All</option>
              {engineers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {tab === "engineer" && (
        <div className="form-row" style={{ marginBottom: "1rem" }}>
          <label>
            Engineer
            <select
              value={selectedEngineerId}
              onChange={(e) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("engineerId", e.target.value);
                  next.delete("page");
                  return next;
                });
              }}
            >
              <option value="">Select engineer</option>
              {engineers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Visit #</th>
                <th>Site</th>
                <th>Engineer</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td>{v.visitNumber}</td>
                  <td>{v.siteName} ({v.siteCode})</td>
                  <td>{v.engineerName}</td>
                  <td>{formatDate(v.scheduledDate)}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>{v.type}</td>
                  <td>
                    <Link to={`/operations/visits/${v.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visits.length === 0 && !loading && (
            <p className="text-muted">No visits found.</p>
          )}
          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(p));
                return next;
              });
            }}
          />
        </>
      )}
    </section>
  );
}

