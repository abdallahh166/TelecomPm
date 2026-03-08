'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addChecklistItem,
  addVisitIssue,
  addVisitPhoto,
  addVisitReading,
  approveVisit,
  cancelVisit,
  captureVisitSignature,
  checkInVisit,
  checkOutVisit,
  completeVisit,
  createVisit,
  getEngineerVisits,
  getPendingReviewVisits,
  getScheduledVisits,
  getVisitById,
  getVisitEvidenceStatus,
  getVisitSignature,
  importAlarmEvidence,
  importPanoramaEvidence,
  importUnusedAssets,
  rejectVisit,
  removeVisitPhoto,
  rescheduleVisit,
  resolveVisitIssue,
  requestVisitCorrection,
  startVisit,
  submitVisit,
  updateChecklistItem,
  updateVisitReading,
} from '@/services/visits.service';
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
} from '@/types/visits';

export function useScheduledVisits(date: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['visits', 'scheduled', date, page],
    queryFn: () => getScheduledVisits(date, page),
    enabled: enabled && Boolean(date),
  });
}

export function usePendingReviewVisits(officeId?: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: ['visits', 'pending-reviews', officeId, page],
    queryFn: () => getPendingReviewVisits(officeId, page),
    enabled,
  });
}

export function useEngineerVisits(
  engineerId: string | undefined,
  page = 1,
  filters?: EngineerVisitFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ['visits', 'engineer', engineerId, page, filters?.status, filters?.from, filters?.to],
    queryFn: () => getEngineerVisits(engineerId!, page, 10, filters),
    enabled: enabled && Boolean(engineerId),
  });
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () => getVisitById(id),
    enabled: Boolean(id),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisitPayload) => createVisit(payload),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['visits'] }),
        queryClient.invalidateQueries({ queryKey: ['visits', result.id] }),
      ]);
    },
  });
}

export function useVisitEvidenceStatus(id: string) {
  return useQuery({
    queryKey: ['visits', id, 'evidence-status'],
    queryFn: () => getVisitEvidenceStatus(id),
    enabled: Boolean(id),
  });
}

export function useVisitSignature(id: string) {
  return useQuery({
    queryKey: ['visits', id, 'signature'],
    queryFn: () => getVisitSignature(id),
    enabled: Boolean(id),
    retry: false,
  });
}

async function invalidateVisitQueries(queryClient: ReturnType<typeof useQueryClient>, visitId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['visits'] }),
    queryClient.invalidateQueries({ queryKey: ['visits', visitId] }),
    queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'evidence-status'] }),
    queryClient.invalidateQueries({ queryKey: ['visits', visitId, 'signature'] }),
  ]);
}

function useVisitMutation<TPayload>(id: string, mutationFn: (visitId: string, payload: TPayload) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TPayload) => mutationFn(id, payload),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useStartVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: StartVisitPayload) => startVisit(visitId, payload));
}

export function useCheckInVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: CheckInVisitPayload) => checkInVisit(visitId, payload));
}

export function useCheckOutVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: CheckOutVisitPayload) => checkOutVisit(visitId, payload));
}

export function useCompleteVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: CompleteVisitPayload) => completeVisit(visitId, payload));
}

export function useCancelVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: CancelVisitPayload) => cancelVisit(visitId, payload));
}

export function useRescheduleVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: RescheduleVisitPayload) => rescheduleVisit(visitId, payload));
}

export function useSubmitVisit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitVisit(id),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useApproveVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: ApproveVisitPayload) => approveVisit(visitId, payload));
}

export function useRejectVisit(id: string) {
  return useVisitMutation(id, (visitId, payload: RejectVisitPayload) => rejectVisit(visitId, payload));
}

export function useRequestVisitCorrection(id: string) {
  return useVisitMutation(id, (visitId, payload: RequestCorrectionPayload) =>
    requestVisitCorrection(visitId, payload),
  );
}

export function useAddChecklistItem(id: string) {
  return useVisitMutation(id, (visitId, payload: AddChecklistItemPayload) => addChecklistItem(visitId, payload));
}

export function useUpdateChecklistItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { checklistItemId: string; payload: UpdateChecklistItemPayload }) =>
      updateChecklistItem(id, input.checklistItemId, input.payload),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useAddVisitIssue(id: string) {
  return useVisitMutation(id, (visitId, payload: AddVisitIssuePayload) => addVisitIssue(visitId, payload));
}

export function useResolveVisitIssue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { issueId: string; payload: ResolveVisitIssuePayload }) =>
      resolveVisitIssue(id, input.issueId, input.payload),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useAddVisitReading(id: string) {
  return useVisitMutation(id, (visitId, payload: AddVisitReadingPayload) => addVisitReading(visitId, payload));
}

export function useUpdateVisitReading(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { readingId: string; payload: UpdateVisitReadingPayload }) =>
      updateVisitReading(id, input.readingId, input.payload),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useAddVisitPhoto(id: string) {
  return useVisitMutation(id, (visitId, payload: AddVisitPhotoPayload) => addVisitPhoto(visitId, payload));
}

export function useRemoveVisitPhoto(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => removeVisitPhoto(id, photoId),
    onSuccess: async () => {
      await invalidateVisitQueries(queryClient, id);
    },
  });
}

export function useCaptureVisitSignature(id: string) {
  return useVisitMutation(id, (visitId, payload: CaptureVisitSignaturePayload) => captureVisitSignature(visitId, payload));
}

export function useImportPanoramaEvidence(id: string) {
  return useVisitMutation(id, (visitId, payload: ImportVisitEvidencePayload) => importPanoramaEvidence(visitId, payload));
}

export function useImportAlarmEvidence(id: string) {
  return useVisitMutation(id, (visitId, payload: ImportVisitEvidencePayload) => importAlarmEvidence(visitId, payload));
}

export function useImportUnusedAssets(id: string) {
  return useVisitMutation(id, (visitId, payload: ImportVisitEvidencePayload) => importUnusedAssets(visitId, payload));
}
