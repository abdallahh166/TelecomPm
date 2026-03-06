import { apiClient } from "../../core/http/apiClient";
import { buildQuery } from "./common";

export type OperationsKpiDashboardDto = {
  generatedAtUtc: string;
  fromDateUtc?: string;
  toDateUtc?: string;
  officeCode?: string;
  slaClass?: string;
  totalWorkOrders: number;
  openWorkOrders: number;
  breachedWorkOrders: number;
  atRiskWorkOrders: number;
  slaCompliancePercentage: number;
  totalReviewedVisits: number;
  ftfRatePercent: number;
  mttrHours: number;
  reopenRatePercent: number;
  evidenceCompletenessPercent: number;
  firstTimeFixPercentage: number;
  reopenRatePercentage: number;
  evidenceCompletenessPercentage: number;
  meanTimeToRepairHours: number;
};

type OperationsDashboardQuery = {
  fromDateUtc?: string;
  toDateUtc?: string;
  officeCode?: string;
  slaClass?: string;
};

export const kpiApi = {
  async getOperationsDashboard(query: OperationsDashboardQuery = {}): Promise<OperationsKpiDashboardDto> {
    const response = await apiClient.request<OperationsKpiDashboardDto>(
      `/kpi/operations${buildQuery({
        fromDateUtc: query.fromDateUtc,
        toDateUtc: query.toDateUtc,
        officeCode: query.officeCode,
        slaClass: query.slaClass,
      })}`,
    );
    return response.data;
  },
};
