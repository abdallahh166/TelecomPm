export type ApiFieldErrors = Record<string, string[]>;

export type ApiError = {
  code: string;
  message: string;
  correlationId: string;
  errors?: ApiFieldErrors;
  meta?: Record<string, string>;
  status?: number;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiSuccess<T> = {
  data: T;
  pagination?: PaginationMetadata;
};
