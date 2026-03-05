import { ApiRequestError } from "../../core/http/apiError";

function flattenErrors(errors: Record<string, string[]> | undefined): string[] {
  if (!errors) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => messages)
    .map((message) => message.trim())
    .filter(Boolean);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiRequestError)) {
    return fallback;
  }

  const fieldErrors = flattenErrors(error.apiError.errors);
  if (fieldErrors.length > 0) {
    return fieldErrors[0];
  }

  return error.apiError.message || fallback;
}
