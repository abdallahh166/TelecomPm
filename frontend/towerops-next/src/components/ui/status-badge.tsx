export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200">{status}</span>
  );
}
