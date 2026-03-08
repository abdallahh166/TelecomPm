'use client';

import { useQuery } from '@tanstack/react-query';
import { getEscalations } from '@/services/escalations.service';

export function useEscalations() {
  return useQuery({ queryKey: ['escalations'], queryFn: getEscalations });
}
