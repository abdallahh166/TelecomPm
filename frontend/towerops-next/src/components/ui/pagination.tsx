import { Button } from './button';

export function Pagination({ page, hasNext, onPrev, onNext }: { page: number; hasNext: boolean; onPrev: () => void; onNext: () => void; }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Button disabled={page <= 1} onClick={onPrev} type="button">
        Previous
      </Button>
      <span className="text-sm text-slate-300">Page {page}</span>
      <Button disabled={!hasNext} onClick={onNext} type="button">
        Next
      </Button>
    </div>
  );
}
