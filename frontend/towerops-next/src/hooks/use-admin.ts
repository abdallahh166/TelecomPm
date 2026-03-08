'use client';

import { useQuery } from '@tanstack/react-query';
import { getOffices, getRoles, getSettings, getUsers } from '@/services/admin.service';

export function useUsers(page: number) {
  return useQuery({ queryKey: ['admin', 'users', page], queryFn: () => getUsers(page) });
}

export function useOffices(page: number) {
  return useQuery({ queryKey: ['admin', 'offices', page], queryFn: () => getOffices(page) });
}

export function useRoles(page: number) {
  return useQuery({ queryKey: ['admin', 'roles', page], queryFn: () => getRoles(page) });
}

export function useSettings(page: number) {
  return useQuery({ queryKey: ['admin', 'settings', page], queryFn: () => getSettings(page) });
}
