'use client';

import { useQuery } from '@tanstack/react-query';
import { getChecklistTemplates } from '@/services/checklist-templates.service';

export function useChecklistTemplates() {
  return useQuery({ queryKey: ['checklist-templates'], queryFn: getChecklistTemplates });
}
