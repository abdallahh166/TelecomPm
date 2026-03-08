'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignSiteToEngineer,
  createDailyPlan,
  getDailyPlan,
  getSuggestedOrder,
  getUnassignedSites,
  publishDailyPlan,
  removeSiteFromEngineer,
} from '@/services/daily-plans.service';
import {
  AssignSiteToEngineerPayload,
  CreateDailyPlanPayload,
  DailyPlan,
  PlannedVisitStop,
  RemoveSiteFromEngineerPayload,
} from '@/types/daily-plans';

function dailyPlanKey(officeId: string, date: string) {
  return ['daily-plans', officeId, date];
}

export function useDailyPlan(officeId: string | undefined, date: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['daily-plans', officeId, date],
    queryFn: () => getDailyPlan(officeId!, date!),
    enabled: enabled && Boolean(officeId) && Boolean(date),
  });
}

export function useUnassignedSites(officeId: string | undefined, date: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['daily-plans', 'unassigned', officeId, date],
    queryFn: () => getUnassignedSites(officeId!, date!),
    enabled: enabled && Boolean(officeId) && Boolean(date),
  });
}

export function useCreateDailyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDailyPlanPayload) => createDailyPlan(payload),
    onSuccess: async (_result, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['daily-plans'] }),
        queryClient.invalidateQueries({ queryKey: dailyPlanKey(payload.officeId, payload.planDate) }),
      ]);
    },
  });
}

function useDailyPlanMutation<TPayload, TResult>(
  planId: string,
  officeId: string,
  date: string,
  mutationFn: (id: string, payload: TPayload) => Promise<TResult>,
) {
  const queryClient = useQueryClient();

  return useMutation<TResult, unknown, TPayload>({
    mutationFn: (payload: TPayload) => mutationFn(planId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['daily-plans'] }),
        queryClient.invalidateQueries({ queryKey: dailyPlanKey(officeId, date) }),
        queryClient.invalidateQueries({ queryKey: ['daily-plans', 'unassigned', officeId, date] }),
        queryClient.invalidateQueries({ queryKey: ['daily-plans', 'suggested', planId] }),
      ]);
    },
  });
}

export function useAssignSiteToEngineer(planId: string, officeId: string, date: string) {
  return useDailyPlanMutation(
    planId,
    officeId,
    date,
    (id, payload: AssignSiteToEngineerPayload): Promise<DailyPlan> => assignSiteToEngineer(id, payload),
  );
}

export function useRemoveSiteFromEngineer(planId: string, officeId: string, date: string) {
  return useDailyPlanMutation(
    planId,
    officeId,
    date,
    (id, payload: RemoveSiteFromEngineerPayload): Promise<DailyPlan> => removeSiteFromEngineer(id, payload),
  );
}

export function usePublishDailyPlan(planId: string, officeId: string, date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => publishDailyPlan(planId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['daily-plans'] }),
        queryClient.invalidateQueries({ queryKey: dailyPlanKey(officeId, date) }),
        queryClient.invalidateQueries({ queryKey: ['daily-plans', 'unassigned', officeId, date] }),
        queryClient.invalidateQueries({ queryKey: ['daily-plans', 'suggested', planId] }),
      ]);
    },
  });
}

export function useSuggestDailyPlanOrder(planId: string, officeId: string, date: string) {
  return useDailyPlanMutation(
    planId,
    officeId,
    date,
    (id, engineerId: string): Promise<PlannedVisitStop[]> => getSuggestedOrder(id, engineerId),
  );
}
