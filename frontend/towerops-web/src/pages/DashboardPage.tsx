import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../features/auth/context/AuthContext";
import { kpiApi, type OperationsKpiDashboardDto } from "../features/operations/kpiApi";
import { OperationsPermissionKeys } from "../features/operations/permissionKeys";
import { getErrorMessage } from "../shared/errors/errorMessage";

export function DashboardPage() {
  const { session, hasPermission } = useAuth();
  const [kpi, setKpi] = useState<OperationsKpiDashboardDto | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);

  const canViewKpi = hasPermission(OperationsPermissionKeys.kpiView);

  const loadKpi = useCallback(async () => {
    if (!canViewKpi) return;
    setKpiLoading(true);
    setKpiError(null);
    try {
      const data = await kpiApi.getOperationsDashboard({});
      setKpi(data);
    } catch (e) {
      setKpiError(getErrorMessage(e));
    } finally {
      setKpiLoading(false);
    }
  }, [canViewKpi]);

  useEffect(() => {
    void loadKpi();
  }, [loadKpi]);

  return (
    <section className="page">
      <div>
        <h2>Dashboard</h2>
        <p className="text-muted">
          TowerOps operations overview. Role: {session?.role ?? "-"}.
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

      {canViewKpi && (
        <>
          {kpiError && (
            <div className="alert alert--error" role="alert">
              {kpiError}
            </div>
          )}
          {kpiLoading && <p className="text-muted">Loading KPI…</p>}
          {kpi && !kpiLoading && (
            <article className="panel" style={{ marginTop: "1rem" }}>
              <h3>Operations KPI</h3>
              <div className="metric-grid">
                <article className="metric-box">
                  <strong>{kpi.totalWorkOrders}</strong>
                  <span>Total work orders</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.openWorkOrders}</strong>
                  <span>Open</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.breachedWorkOrders}</strong>
                  <span>Breached</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.atRiskWorkOrders}</strong>
                  <span>At risk</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.slaCompliancePercentage.toFixed(1)}%</strong>
                  <span>SLA compliance</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.totalReviewedVisits}</strong>
                  <span>Reviewed visits</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.ftfRatePercent.toFixed(1)}%</strong>
                  <span>First-time fix</span>
                </article>
                <article className="metric-box">
                  <strong>{kpi.evidenceCompletenessPercent.toFixed(1)}%</strong>
                  <span>Evidence completeness</span>
                </article>
              </div>
            </article>
          )}
        </>
      )}

      <article className="panel" style={{ marginTop: "1rem" }}>
        <h3>Permission snapshot</h3>
        <p className="text-muted">Parsed from JWT permission claims.</p>
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

