'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateUser,
  changeUserRole,
  createUser,
  deactivateUser,
  deleteUser,
  getUserById,
  getUserPerformance,
  getUsersByOffice,
  getUsersByRole,
  unlockUserAccount,
  updateUser,
} from '@/services/users.service';
import {
  ChangeUserRolePayload,
  CreateUserPayload,
  UpdateUserPayload,
  UserListFilters,
  UserRoleFilters,
} from '@/types/users';

export function useUsersByOffice(
  officeId: string | undefined,
  page = 1,
  filters?: UserListFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ['users', 'office', officeId, page, filters?.onlyActive, filters?.pageSize],
    queryFn: () => getUsersByOffice(officeId!, page, filters),
    enabled: enabled && Boolean(officeId),
  });
}

export function useUsersByRole(role: string | undefined, page = 1, filters?: UserRoleFilters, enabled = true) {
  return useQuery({
    queryKey: ['users', 'role', role, page, filters?.officeId, filters?.pageSize],
    queryFn: () => getUsersByRole(role!, page, filters),
    enabled: enabled && Boolean(role),
  });
}

export function useUser(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId!),
    enabled: enabled && Boolean(userId),
  });
}

export function useUserPerformance(
  userId: string | undefined,
  fromDate?: string,
  toDate?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['users', userId, 'performance', fromDate, toDate],
    queryFn: () => getUserPerformance(userId!, fromDate, toDate),
    enabled: enabled && Boolean(userId),
  });
}

async function invalidateUserCaches(queryClient: ReturnType<typeof useQueryClient>, userId?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['users'] }),
    userId ? queryClient.invalidateQueries({ queryKey: ['users', userId] }) : Promise.resolve(),
    userId ? queryClient.invalidateQueries({ queryKey: ['users', userId, 'performance'] }) : Promise.resolve(),
  ]);
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: async (result) => {
      await invalidateUserCaches(queryClient, result?.id);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { userId: string; payload: UpdateUserPayload }) =>
      updateUser(variables.userId, variables.payload),
    onSuccess: async (_result, variables) => {
      await invalidateUserCaches(queryClient, variables.userId);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: async (_result, userId) => {
      await invalidateUserCaches(queryClient, userId);
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { userId: string; payload: ChangeUserRolePayload }) =>
      changeUserRole(variables.userId, variables.payload),
    onSuccess: async (_result, variables) => {
      await invalidateUserCaches(queryClient, variables.userId);
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => activateUser(userId),
    onSuccess: async (_result, userId) => {
      await invalidateUserCaches(queryClient, userId);
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: async (_result, userId) => {
      await invalidateUserCaches(queryClient, userId);
    },
  });
}

export function useUnlockUserAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unlockUserAccount(userId),
    onSuccess: async (_result, userId) => {
      await invalidateUserCaches(queryClient, userId);
    },
  });
}
