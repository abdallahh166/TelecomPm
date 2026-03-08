import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

type Tokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

let getTokens: () => Tokens = () => ({ accessToken: null, refreshToken: null });
let onAuthFailure: (() => void) | null = null;
let refreshTokens: (() => Promise<Tokens>) | null = null;

export function configureApiClient(options: {
  getTokensProvider: () => Tokens;
  authFailureHandler: () => void;
  refreshTokensHandler: () => Promise<Tokens>;
}) {
  getTokens = options.getTokensProvider;
  onAuthFailure = options.authFailureHandler;
  refreshTokens = options.refreshTokensHandler;
}

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  config.headers['Accept-Language'] = 'en-US';

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config as (typeof error.config & { _retried?: boolean }) | undefined;

    if (status === 401 && originalRequest && !originalRequest._retried && refreshTokens) {
      try {
        originalRequest._retried = true;
        const tokens = await refreshTokens();

        if (tokens.accessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return apiClient.request(originalRequest);
        }
      } catch {
        onAuthFailure?.();
      }
    }

    if (status === 401) {
      onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);
