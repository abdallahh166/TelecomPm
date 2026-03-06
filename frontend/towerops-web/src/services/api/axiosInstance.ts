import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { CORRELATION_HEADER_NAME, createCorrelationId } from "../../utils/correlation";
import { toApiError, ApiRequestError } from "../errorAdapter";

const DEFAULT_BASE_URL = "/api";
const LANG_STORAGE_KEY = "towerops.lang";

function getStoredLanguage(): string {
  if (typeof window === "undefined") return "en-US";
  return window.localStorage.getItem(LANG_STORAGE_KEY) ?? "en-US";
}

type AuthRegistry = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
};

let authRegistry: AuthRegistry | null = null;

export function setApiAuthRegistry(registry: AuthRegistry | null): void {
  authRegistry = registry;
}

type ErrorListener = (error: ApiRequestError) => void;
let globalErrorListener: ErrorListener | null = null;

export function setApiErrorListener(listener: ErrorListener | null): void {
  globalErrorListener = listener;
}

let refreshInFlight: Promise<string | null> | null = null;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const correlationId =
    (config.headers?.[CORRELATION_HEADER_NAME] as string) || createCorrelationId();
  config.headers[CORRELATION_HEADER_NAME] = correlationId;
  config.headers["Accept-Language"] = getStoredLanguage();

  const skipAuth = (config as { skipAuth?: boolean }).skipAuth;
  if (!skipAuth && authRegistry) {
    const token = authRegistry.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (err: AxiosError) => {
    const originalRequest = err.config as (InternalAxiosRequestConfig & { _retry?: boolean; skipAuth?: boolean; suppressGlobalError?: boolean }) | undefined;
    const correlationId =
      (err.response?.headers?.[CORRELATION_HEADER_NAME] as string) ||
      (originalRequest?.headers?.[CORRELATION_HEADER_NAME] as string) ||
      createCorrelationId();

    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuth &&
      authRegistry
    ) {
      originalRequest._retry = true;
      if (!refreshInFlight) {
        refreshInFlight = authRegistry
          .refreshAccessToken()
          .finally(() => {
            refreshInFlight = null;
          });
      }
      const newToken = await refreshInFlight;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
      authRegistry.onAuthFailure();
    }

    const status = err.response?.status ?? 500;
    const payload = err.response?.data;
    const apiError = toApiError(payload, status, correlationId);
    const requestError = new ApiRequestError(apiError);

    const suppressGlobalError = originalRequest?.suppressGlobalError;
    if (!suppressGlobalError && globalErrorListener) {
      globalErrorListener(requestError);
    }

    return Promise.reject(requestError);
  },
);
