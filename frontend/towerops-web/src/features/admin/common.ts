import type { PaginationMetadata } from "../../core/http/apiTypes";

export type SortDirection = "asc" | "desc";

export type PagedQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDirection;
};

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(key, String(value));
  }

  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function defaultPagination(): PaginationMetadata {
  return {
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}
