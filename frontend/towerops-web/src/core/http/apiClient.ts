import { ApiRequestError, toApiError } from "./apiError";
import type { ApiError, ApiRequestOptions, ApiSuccess } from "./apiTypes";
import { CORRELATION_HEADER_NAME, createCorrelationId } from "./correlation";
import { adaptApiSuccess } from "./successAdapter";

type ErrorListener = (error: ApiError) => void;
type AuthRefreshHandler = () => Promise<string | null>;
type AuthFailureHandler = () => void;
type AuthHandlerRegistry = {
  refreshAccessToken: AuthRefreshHandler;
  onAuthFailure: AuthFailureHandler;
};

const DEFAULT_BASE_URL = "/api";
const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE ?? "en-US";
const DEFAULT_TIMEOUT_MS = parseTimeoutMs(import.meta.env.VITE_API_TIMEOUT_MS, 15000);
const LANGUAGE_STORAGE_KEY = "towerops.lang";
const NETWORK_ERROR_CODE = "request.network_error";
const TIMEOUT_ERROR_CODE = "request.timeout";

let globalErrorListener: ErrorListener | null = null;
let authHandlers: AuthHandlerRegistry | null = null;
let refreshInFlight: Promise<string | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTimeoutMs(value: unknown, fallback: number): number {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function createClientError(
  code: string,
  message: string,
  correlationId: string,
): ApiRequestError {
  return new ApiRequestError({
    code,
    message,
    correlationId,
  });
}

async function tryRefreshAccessToken(): Promise<string | null> {
  if (!authHandlers) {
    return null;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = authHandlers.refreshAccessToken()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function notifyGlobalError(options: ApiRequestOptions, error: ApiError): void {
  if (!options.suppressGlobalError && globalErrorListener) {
    globalErrorListener(error);
  }
}

export function setApiErrorListener(listener: ErrorListener | null): void {
  globalErrorListener = listener;
}

export function setApiAuthHandlers(handlers: AuthHandlerRegistry | null): void {
  authHandlers = handlers;
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

  private async executeRequest(endpoint: string, options: ApiRequestOptions, correlationId: string): Promise<Response> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const abortController = new AbortController();

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    if (timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        abortController.abort("request-timeout");
      }, timeoutMs);
    }

    let externalAbortListener: (() => void) | null = null;
    if (options.signal) {
      if (options.signal.aborted) {
        abortController.abort("external-abort");
      } else {
        externalAbortListener = () => {
          abortController.abort("external-abort");
        };
        options.signal.addEventListener("abort", externalAbortListener, { once: true });
      }
    }

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

    try {
      return await fetch(endpoint, {
        method: options.method ?? "GET",
        headers,
        body: options.body
          ? isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body)
          : undefined,
        signal: abortController.signal,
      });
    } catch (error) {
      const requestError = isAbortError(error)
        ? createClientError(
          TIMEOUT_ERROR_CODE,
          "Request timed out. Please retry.",
          correlationId,
        )
        : createClientError(
          NETWORK_ERROR_CODE,
          "Network request failed. Check connectivity and retry.",
          correlationId,
        );

      notifyGlobalError(options, requestError.apiError);
      throw requestError;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      if (options.signal && externalAbortListener) {
        options.signal.removeEventListener("abort", externalAbortListener);
      }
    }
  }

  private async requestInternal<T>(
    path: string,
    options: ApiRequestOptions,
    hasRetried: boolean,
  ): Promise<ApiSuccess<T>> {
    const correlationId = createCorrelationId();
    const endpoint = joinUrl(this.baseUrl, path);
    const response = await this.executeRequest(endpoint, options, correlationId);
    const responseCorrelationId =
      response.headers.get(CORRELATION_HEADER_NAME) ?? correlationId;

    if (response.status === 401 && !options.skipAuth && !hasRetried) {
      const refreshedToken = await tryRefreshAccessToken();
      if (refreshedToken) {
        this.setAccessToken(refreshedToken);
        return this.requestInternal<T>(path, options, true);
      }

      if (authHandlers) {
        authHandlers.onAuthFailure();
      }
    }

    if (response.status === 204) {
      return adaptApiSuccess<T>(null);
    }

    const responseText = await response.text();
    const payload = parseResponseBody(response.headers.get("Content-Type"), responseText);

    if (!response.ok) {
      const parsedError = toApiError(payload, response.status, responseCorrelationId);
      notifyGlobalError(options, parsedError);
      throw new ApiRequestError(parsedError);
    }

    if (isRecord(payload) && typeof payload.correlationId !== "string") {
      payload.correlationId = responseCorrelationId;
    }

    return adaptApiSuccess<T>(payload);
  }

  public async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ApiSuccess<T>> {
    return this.requestInternal<T>(path, options, false);
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL);
