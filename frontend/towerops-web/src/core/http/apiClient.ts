import { ApiRequestError, toApiError } from "./apiError";
import type { ApiError, ApiRequestOptions, ApiSuccess } from "./apiTypes";
import { CORRELATION_HEADER_NAME, createCorrelationId } from "./correlation";
import { adaptApiSuccess } from "./successAdapter";

type ErrorListener = (error: ApiError) => void;

const DEFAULT_BASE_URL = "/api";
const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE ?? "en-US";
const LANGUAGE_STORAGE_KEY = "towerops.lang";

let globalErrorListener: ErrorListener | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readLanguage(): string {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE;
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function parseResponseBody(contentType: string | null, text: string): unknown {
  if (!text) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return {
        message: text,
      };
    }
  }

  return {
    message: text,
  };
}

export function setApiErrorListener(listener: ErrorListener | null): void {
  globalErrorListener = listener;
}

class ApiClient {
  private readonly baseUrl: string;
  private accessToken: string | null;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.accessToken = null;
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiSuccess<T>> {
    const correlationId = createCorrelationId();
    const endpoint = joinUrl(this.baseUrl, path);
    const isFormData = options.body instanceof FormData;
    const headers = new Headers(options.headers);

    headers.set("Accept-Language", readLanguage());
    headers.set(CORRELATION_HEADER_NAME, correlationId);

    if (!isFormData) {
      headers.set("Content-Type", "application/json");
    }

    if (!options.skipAuth && this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(endpoint, {
      method: options.method ?? "GET",
      headers,
      body: options.body
        ? isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body)
        : undefined,
      signal: options.signal,
    });

    const responseCorrelationId =
      response.headers.get(CORRELATION_HEADER_NAME) ?? correlationId;

    if (response.status === 204) {
      return adaptApiSuccess<T>(null);
    }

    const responseText = await response.text();
    const payload = parseResponseBody(response.headers.get("Content-Type"), responseText);

    if (!response.ok) {
      const parsedError = toApiError(payload, response.status, responseCorrelationId);
      if (!options.suppressGlobalError && globalErrorListener) {
        globalErrorListener(parsedError);
      }

      throw new ApiRequestError(parsedError);
    }

    if (isRecord(payload) && typeof payload.correlationId !== "string") {
      payload.correlationId = responseCorrelationId;
    }

    return adaptApiSuccess<T>(payload);
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL);
