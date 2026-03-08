import { Pagination } from '@/types/api';

export function normalizePagination(input?: Partial<Pagination>): Pagination {
  return {
    page: input?.page ?? 1,
    pageSize: input?.pageSize ?? 25,
    total: input?.total ?? 0,
    totalPages: input?.totalPages ?? 0,
    hasNextPage: input?.hasNextPage ?? false,
    hasPreviousPage: input?.hasPreviousPage ?? false,
  };
}
