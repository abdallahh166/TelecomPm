'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getRoleById,
  getRolePermissions,
  getRoles,
  updateRole,
} from '@/services/roles.service';
import { CreateRolePayload, RoleListFilters, UpdateRolePayload } from '@/types/roles';

export function useRoles(page = 1, filters?: RoleListFilters, enabled = true) {
  return useQuery({
    queryKey: ['roles', page, filters?.pageSize, filters?.sortBy, filters?.sortDir],
    queryFn: () => getRoles(page, filters),
    enabled,
  });
}

export function useRole(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRoleById(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useRolePermissions(enabled = true) {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: getRolePermissions,
    enabled,
  });
}

async function invalidateRoleCaches(queryClient: ReturnType<typeof useQueryClient>, roleId?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['roles'] }),
    roleId ? queryClient.invalidateQueries({ queryKey: ['roles', roleId] }) : Promise.resolve(),
  ]);
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: async (result) => {
      await invalidateRoleCaches(queryClient, result?.name);
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { roleId: string; payload: UpdateRolePayload }) =>
      updateRole(variables.roleId, variables.payload),
    onSuccess: async (_result, variables) => {
      await invalidateRoleCaches(queryClient, variables.roleId);
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: async (_result, roleId) => {
      await invalidateRoleCaches(queryClient, roleId);
    },
  });
}
