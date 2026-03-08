import { apiClient } from "../../core/http/apiClient";

export const SLA_CLASS_OPTIONS = ["P1", "P2", "P3", "P4"] as const;
export type SlaClass = (typeof SLA_CLASS_OPTIONS)[number];

export const ESCALATION_LEVEL_OPTIONS = [
  "AreaManager",
  "BMManagement",
  "ProjectSponsor",
] as const;
export type EscalationLevel = (typeof ESCALATION_LEVEL_OPTIONS)[number];

export const ESCALATION_STATUS_OPTIONS = [
  "Submitted",
  "UnderReview",
  "Approved",
  "Rejected",
  "Closed",
] as const;
export type EscalationStatus = (typeof ESCALATION_STATUS_OPTIONS)[number];

export type EscalationDto = {
  id: string;
  workOrderId: string;
  incidentId: string;
  siteCode: string;
  slaClass: SlaClass;
  financialImpactEgp: number;
  slaImpactPercentage: number;
  evidencePackage: string;
  previousActions: string;
  recommendedDecision: string;
  level: EscalationLevel;
  status: EscalationStatus;
  submittedBy: string;
  submittedAtUtc: string;
};

export type CreateEscalationRequest = {
  workOrderId: string;
  incidentId: string;
  siteCode: string;
  slaClass: SlaClass;
  financialImpactEgp: number;
  slaImpactPercentage: number;
  evidencePackage: string;
  previousActions: string;
  recommendedDecision: string;
  level: EscalationLevel;
  submittedBy: string;
};

export const escalationsApi = {
  async getById(escalationId: string): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>(`/escalations/${escalationId}`);
    return response.data;
  },

  async create(request: CreateEscalationRequest): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>("/escalations", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async review(id: string): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>(`/escalations/${id}/review`, {
      method: "PATCH",
    });
    return response.data;
  },

  async approve(id: string): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>(`/escalations/${id}/approve`, {
      method: "PATCH",
    });
    return response.data;
  },

  async reject(id: string): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>(`/escalations/${id}/reject`, {
      method: "PATCH",
    });
    return response.data;
  },

  async close(id: string): Promise<EscalationDto> {
    const response = await apiClient.request<EscalationDto>(`/escalations/${id}/close`, {
      method: "PATCH",
    });
    return response.data;
  },
};

