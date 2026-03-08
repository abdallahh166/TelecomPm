import { formatLabel } from '@/lib/format';

function resolveTone(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes('approved') ||
    normalized.includes('closed') ||
    normalized.includes('completed')
  ) {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  }

  if (
    normalized.includes('cancelled') ||
    normalized.includes('rejected') ||
    normalized.includes('failed')
  ) {
    return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
  }

  if (
    normalized.includes('review') ||
    normalized.includes('scheduled') ||
    normalized.includes('pending')
  ) {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
  }

  if (normalized.includes('progress') || normalized.includes('submitted')) {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-200';
  }

  return 'border-slate-700 bg-slate-900 text-slate-200';
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2 py-1 text-xs ${resolveTone(status)}`}>
      {formatLabel(status)}
    </span>
  );
}
