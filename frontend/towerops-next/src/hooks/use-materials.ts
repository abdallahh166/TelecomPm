'use client';

import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '@/services/materials.service';

export function useMaterials(page: number) {
  return useQuery({ queryKey: ['materials', page], queryFn: () => getMaterials(page) });
}
