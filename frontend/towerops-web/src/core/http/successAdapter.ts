import type { ApiSuccess, PaginationMetadata } from "./apiTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  return null;
}

function parsePagination(value: unknown): PaginationMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const page = toNumber(value.page);
  const pageSize = toNumber(value.pageSize);
  const total = toNumber(value.total);
  const totalPages = toNumber(value.totalPages);
  const hasNextPage = toBoolean(value.hasNextPage);
  const hasPreviousPage = toBoolean(value.hasPreviousPage);

  if (
    page === null ||
    pageSize === null ||
    total === null ||
    totalPages === null ||
    hasNextPage === null ||
    hasPreviousPage === null
  ) {
    return undefined;
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

export function adaptApiSuccess<T>(payload: unknown): ApiSuccess<T> {
  if (isRecord(payload) && "data" in payload) {
    return {
      data: payload.data as T,
      pagination: parsePagination(payload.pagination),
    };
  }

  return {
    data: payload as T,
  };
}
