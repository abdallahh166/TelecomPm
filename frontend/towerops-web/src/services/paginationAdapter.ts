import type { PaginationMetadata } from "../types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

export function parsePagination(value: unknown): PaginationMetadata | undefined {
  if (!isRecord(value)) return undefined;
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
