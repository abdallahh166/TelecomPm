import { apiClient } from '@/lib/api-client';
import {
  ActivateChecklistTemplatePayload,
  ChecklistTemplate,
  CreateChecklistTemplatePayload,
  ImportChecklistTemplatePayload,
  ImportChecklistTemplateResult,
} from '@/types/checklist-templates';

export async function getActiveChecklistTemplate(visitType: string) {
  const response = await apiClient.get<ChecklistTemplate>('/checklisttemplates', {
    params: { visitType },
  });
  return response.data;
}

export async function getChecklistTemplateById(id: string) {
  const response = await apiClient.get<ChecklistTemplate>(`/checklisttemplates/${id}`);
  return response.data;
}

export async function getChecklistTemplateHistory(visitType: string) {
  const response = await apiClient.get<ChecklistTemplate[]>('/checklisttemplates/history', {
    params: { visitType },
  });
  return response.data;
}

export async function createChecklistTemplate(payload: CreateChecklistTemplatePayload) {
  const response = await apiClient.post<string>('/checklisttemplates', payload);
  return response.data;
}

export async function activateChecklistTemplate(id: string, payload: ActivateChecklistTemplatePayload) {
  await apiClient.post(`/checklisttemplates/${id}/activate`, payload);
}

export async function importChecklistTemplate(payload: ImportChecklistTemplatePayload) {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('visitType', payload.visitType);
  formData.append('version', payload.version);
  formData.append('effectiveFromUtc', payload.effectiveFromUtc);
  formData.append('createdBy', payload.createdBy);
  if (payload.changeNotes) {
    formData.append('changeNotes', payload.changeNotes);
  }

  const response = await apiClient.post<ImportChecklistTemplateResult>('/checklisttemplates/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
