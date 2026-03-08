import { apiClient } from "../../core/http/apiClient";

export type WorkOrderDto = {
  id: string;
  woNumber: string;
  siteCode: string;
  officeCode: string;
  workOrderType: string;
  slaStartAtUtc: string;
  scheduledVisitDateUtc?: string;
  slaClass: string;
  scope: string;
  status: string;
  issueDescription: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  assignedAtUtc?: string;
  responseDeadlineUtc: string;
  resolutionDeadlineUtc: string;
};

export type CreateWorkOrderRequest = {
  woNumber: string;
  siteCode: string;
  officeCode: string;
  workOrderType: string;
  scheduledVisitDateUtc?: string;
  slaClass: string;
  scope: string;
  issueDescription: string;
};

export type AssignWorkOrderRequest = {
  engineerId: string;
  engineerName: string;
  assignedBy: string;
};

export type CustomerAcceptWorkOrderRequest = {
  acceptedBy: string;
};

export type CustomerRejectWorkOrderRequest = {
  reason: string;
};

export const workOrdersApi = {
  async getById(workOrderId: string): Promise<WorkOrderDto> {
    const response = await apiClient.request<WorkOrderDto>(`/workorders/${workOrderId}`);
    return response.data;
  },

  async create(request: CreateWorkOrderRequest): Promise<WorkOrderDto> {
    const response = await apiClient.request<WorkOrderDto>("/workorders", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async assign(workOrderId: string, request: AssignWorkOrderRequest): Promise<void> {
    await apiClient.request<void>(`/workorders/${workOrderId}/assign`, {
      method: "POST",
      body: request,
    });
  },

  async start(id: string): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/start`, {
      method: "PATCH",
    });
  },

  async complete(id: string): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/complete`, {
      method: "PATCH",
    });
  },

  async close(id: string): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/close`, {
      method: "PATCH",
    });
  },

  async cancel(id: string): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/cancel`, {
      method: "PATCH",
    });
  },

  async submitForAcceptance(id: string): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/submit-for-acceptance`, {
      method: "PATCH",
    });
  },

  async customerAccept(id: string, request: CustomerAcceptWorkOrderRequest): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/customer-accept`, {
      method: "PATCH",
      body: request,
    });
  },

  async customerReject(id: string, request: CustomerRejectWorkOrderRequest): Promise<void> {
    await apiClient.request<void>(`/workorders/${id}/customer-reject`, {
      method: "PATCH",
      body: request,
    });
  },
};
