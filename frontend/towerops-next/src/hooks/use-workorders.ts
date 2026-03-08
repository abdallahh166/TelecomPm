'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignWorkOrder,
  cancelWorkOrder,
  captureWorkOrderSignature,
  closeWorkOrder,
  completeWorkOrder,
  createWorkOrder,
  customerAcceptWorkOrder,
  customerRejectWorkOrder,
  getWorkOrderById,
  getWorkOrderSignatures,
  getWorkOrders,
  startWorkOrder,
  submitWorkOrderForAcceptance,
} from '@/services/workorders.service';
import {
  AssignWorkOrderPayload,
  CaptureWorkOrderSignaturePayload,
  CreateWorkOrderPayload,
  CustomerAcceptWorkOrderPayload,
  CustomerRejectWorkOrderPayload,
} from '@/types/workorders';

export function useWorkOrders(page = 1) {
  return useQuery({
    queryKey: ['workorders', page],
    queryFn: () => getWorkOrders(page),
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['workorders', id],
    queryFn: () => getWorkOrderById(id),
    enabled: Boolean(id),
  });
}

export function useWorkOrderSignatures(id: string) {
  return useQuery({
    queryKey: ['workorders', id, 'signatures'],
    queryFn: () => getWorkOrderSignatures(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) => createWorkOrder(payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workorders'] }),
        queryClient.invalidateQueries({ queryKey: ['workorders', result.id] }),
      ]);
    },
  });
}

async function invalidateWorkOrderQueries(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['workorders'] }),
    queryClient.invalidateQueries({ queryKey: ['workorders', id] }),
    queryClient.invalidateQueries({ queryKey: ['workorders', id, 'signatures'] }),
  ]);
}

function useWorkOrderMutation(id: string, mutationFn: (workOrderId: string) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mutationFn(id),
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient, id);
    },
  });
}

export function useAssignWorkOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignWorkOrderPayload) => assignWorkOrder(id, payload),
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient, id);
    },
  });
}

export function useStartWorkOrder(id: string) {
  return useWorkOrderMutation(id, startWorkOrder);
}

export function useCompleteWorkOrder(id: string) {
  return useWorkOrderMutation(id, completeWorkOrder);
}

export function useSubmitWorkOrderForAcceptance(id: string) {
  return useWorkOrderMutation(id, submitWorkOrderForAcceptance);
}

export function useCloseWorkOrder(id: string) {
  return useWorkOrderMutation(id, closeWorkOrder);
}

export function useCancelWorkOrder(id: string) {
  return useWorkOrderMutation(id, cancelWorkOrder);
}

export function useCustomerAcceptWorkOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerAcceptWorkOrderPayload) => customerAcceptWorkOrder(id, payload),
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient, id);
    },
  });
}

export function useCustomerRejectWorkOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerRejectWorkOrderPayload) => customerRejectWorkOrder(id, payload),
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient, id);
    },
  });
}

export function useCaptureWorkOrderSignature(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CaptureWorkOrderSignaturePayload) => captureWorkOrderSignature(id, payload),
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient, id);
    },
  });
}
