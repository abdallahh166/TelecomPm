import { apiClient } from '@/lib/api-client';
import { ChecklistTemplateItem } from '@/types/checklist-templates';

export async function getChecklistTemplates() {
  const response = await apiClient.get<ChecklistTemplateItem[]>('/checklisttemplates');
  return response.data;
}
