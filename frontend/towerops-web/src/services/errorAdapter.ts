import type { ApiError } from "../types/api";

const FALLBACK_ERROR_CODE = "internal.error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asFieldErrors(value: unknown): ApiError["errors"] | undefined {
  if (!isRecord(value)) return undefined;
  const result: Record<string, string[]> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (Array.isArray(fieldValue)) {
      result[key] = fieldValue
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function asMeta(value: unknown): ApiError["meta"] | undefined {
  if (!isRecord(value)) return undefined;
  const meta: Record<string, string> = {};
  for (const [key, metaValue] of Object.entries(value)) {
    if (typeof metaValue === "string") meta[key] = metaValue;
  }
  return Object.keys(meta).length > 0 ? meta : undefined;
}

export function toApiError(
  payload: unknown,
  status: number,
  fallbackCorrelationId: string,
): ApiError {
  if (isRecord(payload)) {
    const code = typeof payload.code === "string" ? payload.code : FALLBACK_ERROR_CODE;
    const message =
      typeof payload.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : `Request failed with status ${status}`;
    const correlationId =
      typeof payload.correlationId === "string" && payload.correlationId.trim().length > 0
        ? payload.correlationId
        : fallbackCorrelationId;
    return {
      code,
      message,
      correlationId,
      errors: asFieldErrors(payload.errors),
      meta: asMeta(payload.meta),
      status,
    };
  }
  return {
    code: FALLBACK_ERROR_CODE,
    message: `Request failed with status ${status}`,
    correlationId: fallbackCorrelationId,
    status,
  };
}

export class ApiRequestError extends Error {
  public readonly apiError: ApiError;

  public constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiRequestError";
    this.apiError = apiError;
  }
}
