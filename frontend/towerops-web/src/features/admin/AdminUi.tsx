import type { PaginationMetadata } from "../../core/http/apiTypes";

type PaginationBarProps = {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
};

export function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  const page = Math.max(pagination.page, 1);
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className="pagination-bar">
      <button
        type="button"
        className="btn-outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={!pagination.hasPreviousPage}
      >
        Prev
      </button>
      <span className="text-muted">
        Page {page} / {totalPages} | Total {pagination.total}
      </span>
      <button
        type="button"
        className="btn-outline"
        onClick={() => onPageChange(page + 1)}
        disabled={!pagination.hasNextPage}
      >
        Next
      </button>
    </div>
  );
}

type StatusBadgeProps = {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
};

export function StatusBadge({
  value,
  trueLabel = "Active",
  falseLabel = "Inactive",
}: StatusBadgeProps) {
  return (
    <span className={value ? "badge badge--ok" : "badge badge--muted"}>
      {value ? trueLabel : falseLabel}
    </span>
  );
}
