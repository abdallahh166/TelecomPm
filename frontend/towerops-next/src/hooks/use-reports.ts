'use client';

import { useMemo } from 'react';
import { getReportCards } from '@/services/reports.service';

export function useReportCards() {
  return useMemo(() => getReportCards(), []);
}
