import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

export function toApiError(error: unknown): ApiError {
  if (!(error instanceof AxiosError)) {
    return { code: 'internal.error', message: 'Unexpected error occurred' };
  }

  const data = error.response?.data as Partial<ApiError> | undefined;
  return {
    code: data?.code ?? 'request.failed',
    message: data?.message ?? 'Request failed',
    correlationId: data?.correlationId,
    errors: data?.errors,
  };
}
