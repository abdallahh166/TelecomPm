export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PagedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type ApiError = {
  code: string;
  message: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
};
