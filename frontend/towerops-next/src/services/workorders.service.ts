import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  AssignWorkOrderPayload,
  CaptureWorkOrderSignaturePayload,
  CreateWorkOrderPayload,
  CustomerAcceptWorkOrderPayload,
  CustomerRejectWorkOrderPayload,
  WorkOrderDetails,
  WorkOrderListItem,
  WorkOrderSignatures,
} from '@/types/workorders';

export async function getWorkOrders(page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<WorkOrderListItem>>('/workorders', {
    params: { page, pageSize },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getWorkOrderById(id: string) {
  const response = await apiClient.get<WorkOrderDetails>(`/workorders/${id}`);
  return response.data;
}

export async function createWorkOrder(payload: CreateWorkOrderPayload) {
  const response = await apiClient.post<WorkOrderDetails>('/workorders', payload);
  return response.data;
}

export async function assignWorkOrder(id: string, payload: AssignWorkOrderPayload) {
  const response = await apiClient.post<WorkOrderDetails>(`/workorders/${id}/assign`, payload);
  return response.data;
}

export async function startWorkOrder(id: string) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/start`);
  return response.data;
}

export async function completeWorkOrder(id: string) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/complete`);
  return response.data;
}

export async function submitWorkOrderForAcceptance(id: string) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/submit-for-acceptance`);
  return response.data;
}

export async function closeWorkOrder(id: string) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/close`);
  return response.data;
}

export async function cancelWorkOrder(id: string) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/cancel`);
  return response.data;
}

export async function customerAcceptWorkOrder(id: string, payload: CustomerAcceptWorkOrderPayload) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/customer-accept`, payload);
  return response.data;
}

export async function customerRejectWorkOrder(id: string, payload: CustomerRejectWorkOrderPayload) {
  const response = await apiClient.patch<WorkOrderDetails>(`/workorders/${id}/customer-reject`, payload);
  return response.data;
}

export async function captureWorkOrderSignature(id: string, payload: CaptureWorkOrderSignaturePayload) {
  const response = await apiClient.post(`/workorders/${id}/signature`, payload);
  return response.data;
}

export async function getWorkOrderSignatures(id: string) {
  const response = await apiClient.get<WorkOrderSignatures>(`/workorders/${id}/signature`);
  return response.data;
}
