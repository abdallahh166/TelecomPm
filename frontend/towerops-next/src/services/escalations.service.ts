import { apiClient } from '@/lib/api-client';
import { CreateEscalationPayload, Escalation } from '@/types/escalations';

export async function getEscalationById(id: string) {
  const response = await apiClient.get<Escalation>(`/escalations/${id}`);
  return response.data;
}

export async function createEscalation(payload: CreateEscalationPayload) {
  const response = await apiClient.post<Escalation>('/escalations', payload);
  return response.data;
}

export async function reviewEscalation(id: string) {
  const response = await apiClient.patch<Escalation>(`/escalations/${id}/review`);
  return response.data;
}

export async function approveEscalation(id: string) {
  const response = await apiClient.patch<Escalation>(`/escalations/${id}/approve`);
  return response.data;
}

export async function rejectEscalation(id: string) {
  const response = await apiClient.patch<Escalation>(`/escalations/${id}/reject`);
  return response.data;
}

export async function closeEscalation(id: string) {
  const response = await apiClient.patch<Escalation>(`/escalations/${id}/close`);
  return response.data;
}
