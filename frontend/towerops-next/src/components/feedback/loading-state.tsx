export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <div className="p-6 text-slate-300">{label}</div>;
}
