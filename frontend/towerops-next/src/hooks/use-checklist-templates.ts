'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateChecklistTemplate,
  createChecklistTemplate,
  getActiveChecklistTemplate,
  getChecklistTemplateById,
  getChecklistTemplateHistory,
  importChecklistTemplate,
} from '@/services/checklist-templates.service';
import {
  ActivateChecklistTemplatePayload,
  CreateChecklistTemplatePayload,
  ImportChecklistTemplatePayload,
} from '@/types/checklist-templates';

export function useActiveChecklistTemplate(visitType: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['checklisttemplates', 'active', visitType],
    queryFn: () => getActiveChecklistTemplate(visitType!),
    enabled: enabled && Boolean(visitType),
  });
}

export function useChecklistTemplate(templateId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['checklisttemplates', templateId],
    queryFn: () => getChecklistTemplateById(templateId!),
    enabled: enabled && Boolean(templateId),
  });
}

export function useChecklistTemplateHistory(visitType: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['checklisttemplates', 'history', visitType],
    queryFn: () => getChecklistTemplateHistory(visitType!),
    enabled: enabled && Boolean(visitType),
  });
}

export function useCreateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChecklistTemplatePayload) => createChecklistTemplate(payload),
    onSuccess: async (_templateId, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates'] }),
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates', 'active', payload.visitType] }),
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates', 'history', payload.visitType] }),
      ]);
    },
  });
}

export function useActivateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      id: string;
      payload: ActivateChecklistTemplatePayload;
      visitType?: string;
    }) => activateChecklistTemplate(variables.id, variables.payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates'] }),
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates', variables.id] }),
        queryClient.invalidateQueries({
          queryKey: ['checklisttemplates', 'active', variables.visitType],
        }),
        queryClient.invalidateQueries({
          queryKey: ['checklisttemplates', 'history', variables.visitType],
        }),
      ]);
    },
  });
}

export function useImportChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ImportChecklistTemplatePayload) => importChecklistTemplate(payload),
    onSuccess: async (_result, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates'] }),
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates', 'active', payload.visitType] }),
        queryClient.invalidateQueries({ queryKey: ['checklisttemplates', 'history', payload.visitType] }),
      ]);
    },
  });
}
