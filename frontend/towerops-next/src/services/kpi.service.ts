import { apiClient } from '@/lib/api-client';
import { OperationsKpiDashboard, OperationsKpiFilters } from '@/types/kpi';

export async function getOperationsKpi(filters?: OperationsKpiFilters) {
  const response = await apiClient.get<OperationsKpiDashboard>('/kpi/operations', {
    params: {
      fromDateUtc: filters?.fromDateUtc,
      toDateUtc: filters?.toDateUtc,
      officeCode: filters?.officeCode,
      slaClass: filters?.slaClass,
    },
  });
  return response.data;
}
