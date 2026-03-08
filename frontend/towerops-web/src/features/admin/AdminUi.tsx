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
      <span className="text-muted">
        Page {page} of {totalPages} | Total {pagination.total}
      </span>
      <div className="table-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!pagination.hasPreviousPage}
          aria-label="Go to previous page"
        >
          Prev
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNextPage}
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
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
