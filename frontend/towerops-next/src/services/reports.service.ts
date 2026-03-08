import { ReportCard } from '@/types/reports';

export function getReportCards(): ReportCard[] {
  return [
    { key: 'scorecard', title: 'Scorecard', endpoint: '/reports/scorecard' },
    { key: 'checklist', title: 'Checklist', endpoint: '/reports/checklist' },
    { key: 'bdt', title: 'Battery Discharge Test', endpoint: '/reports/bdt' },
    { key: 'data-collection', title: 'Data Collection', endpoint: '/reports/data-collection' },
  ];
}
