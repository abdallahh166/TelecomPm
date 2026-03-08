import { apiClient } from '@/lib/api-client';
import { normalizePagination } from '@/lib/pagination-adapter';
import { PagedResponse } from '@/types/api';
import {
  AddChecklistItemPayload,
  AddVisitIssuePayload,
  AddVisitPhotoPayload,
  AddVisitReadingPayload,
  ApproveVisitPayload,
  CancelVisitPayload,
  CaptureVisitSignaturePayload,
  CheckInVisitPayload,
  CheckOutVisitPayload,
  CompleteVisitPayload,
  CreateVisitPayload,
  EngineerVisitFilters,
  ImportVisitEvidencePayload,
  RejectVisitPayload,
  ResolveVisitIssuePayload,
  RescheduleVisitPayload,
  RequestCorrectionPayload,
  StartVisitPayload,
  UpdateChecklistItemPayload,
  UpdateVisitReadingPayload,
  VisitDetails,
  VisitEvidenceStatus,
  VisitListItem,
  VisitSignature,
} from '@/types/visits';

export async function getScheduledVisits(date: string, page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<VisitListItem>>('/visits/scheduled', {
    params: { date, page, pageSize },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getPendingReviewVisits(officeId?: string, page = 1, pageSize = 10) {
  const response = await apiClient.get<PagedResponse<VisitListItem>>('/visits/pending-reviews', {
    params: { officeId, page, pageSize },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getEngineerVisits(
  engineerId: string,
  page = 1,
  pageSize = 10,
  filters?: EngineerVisitFilters,
) {
  const response = await apiClient.get<PagedResponse<VisitListItem>>(`/visits/engineers/${engineerId}`, {
    params: {
      pageNumber: page,
      pageSize,
      status: filters?.status,
      from: filters?.from,
      to: filters?.to,
    },
  });

  return {
    data: response.data.data,
    pagination: normalizePagination(response.data.pagination),
  };
}

export async function getVisitById(id: string) {
  const response = await apiClient.get<VisitDetails>(`/visits/${id}`);
  return response.data;
}

export async function createVisit(payload: CreateVisitPayload) {
  const response = await apiClient.post<VisitDetails>('/visits', payload);
  return response.data;
}

export async function getVisitEvidenceStatus(id: string) {
  const response = await apiClient.get<VisitEvidenceStatus>(`/visits/${id}/evidence-status`);
  return response.data;
}

export async function startVisit(id: string, payload: StartVisitPayload) {
  const response = await apiClient.post<VisitListItem>(`/visits/${id}/start`, payload);
  return response.data;
}

export async function checkInVisit(id: string, payload: CheckInVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/checkin`, payload);
  return response.data;
}

export async function checkOutVisit(id: string, payload: CheckOutVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/checkout`, payload);
  return response.data;
}

export async function completeVisit(id: string, payload: CompleteVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/complete`, payload);
  return response.data;
}

export async function submitVisit(id: string) {
  const response = await apiClient.post(`/visits/${id}/submit`);
  return response.data;
}

export async function cancelVisit(id: string, payload: CancelVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/cancel`, payload);
  return response.data;
}

export async function rescheduleVisit(id: string, payload: RescheduleVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/reschedule`, payload);
  return response.data;
}

export async function approveVisit(id: string, payload: ApproveVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/approve`, payload);
  return response.data;
}

export async function rejectVisit(id: string, payload: RejectVisitPayload) {
  const response = await apiClient.post(`/visits/${id}/reject`, payload);
  return response.data;
}

export async function requestVisitCorrection(id: string, payload: RequestCorrectionPayload) {
  const response = await apiClient.post(`/visits/${id}/request-correction`, payload);
  return response.data;
}

export async function addChecklistItem(id: string, payload: AddChecklistItemPayload) {
  const response = await apiClient.post(`/visits/${id}/checklist-items`, payload);
  return response.data;
}

export async function updateChecklistItem(id: string, checklistItemId: string, payload: UpdateChecklistItemPayload) {
  const response = await apiClient.patch(`/visits/${id}/checklist-items/${checklistItemId}`, payload);
  return response.data;
}

export async function addVisitIssue(id: string, payload: AddVisitIssuePayload) {
  const response = await apiClient.post(`/visits/${id}/issues`, payload);
  return response.data;
}

export async function resolveVisitIssue(id: string, issueId: string, payload: ResolveVisitIssuePayload) {
  const response = await apiClient.post(`/visits/${id}/issues/${issueId}/resolve`, payload);
  return response.data;
}

export async function addVisitReading(id: string, payload: AddVisitReadingPayload) {
  const response = await apiClient.post(`/visits/${id}/readings`, payload);
  return response.data;
}

export async function updateVisitReading(id: string, readingId: string, payload: UpdateVisitReadingPayload) {
  const response = await apiClient.patch(`/visits/${id}/readings/${readingId}`, payload);
  return response.data;
}

export async function addVisitPhoto(id: string, payload: AddVisitPhotoPayload) {
  const formData = new FormData();
  formData.append('type', payload.type);
  formData.append('category', payload.category);
  formData.append('itemName', payload.itemName);
  formData.append('file', payload.file);

  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (typeof payload.latitude === 'number') {
    formData.append('latitude', payload.latitude.toString());
  }
  if (typeof payload.longitude === 'number') {
    formData.append('longitude', payload.longitude.toString());
  }

  const response = await apiClient.post(`/visits/${id}/photos`, formData);
  return response.data;
}

export async function removeVisitPhoto(id: string, photoId: string) {
  const response = await apiClient.delete(`/visits/${id}/photos/${photoId}`);
  return response.data;
}

export async function captureVisitSignature(id: string, payload: CaptureVisitSignaturePayload) {
  const response = await apiClient.post(`/visits/${id}/signature`, payload);
  return response.data;
}

export async function getVisitSignature(id: string) {
  const response = await apiClient.get<VisitSignature>(`/visits/${id}/signature`);
  return response.data;
}

function buildImportFormData(payload: ImportVisitEvidencePayload) {
  const formData = new FormData();
  formData.append('file', payload.file);
  return formData;
}

export async function importPanoramaEvidence(id: string, payload: ImportVisitEvidencePayload) {
  const response = await apiClient.post(`/visits/${id}/import/panorama`, buildImportFormData(payload));
  return response.data;
}

export async function importAlarmEvidence(id: string, payload: ImportVisitEvidencePayload) {
  const response = await apiClient.post(`/visits/${id}/import/alarms`, buildImportFormData(payload));
  return response.data;
}

export async function importUnusedAssets(id: string, payload: ImportVisitEvidencePayload) {
  const response = await apiClient.post(`/visits/${id}/import/unused-assets`, buildImportFormData(payload));
  return response.data;
}
