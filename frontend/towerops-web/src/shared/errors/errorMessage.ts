function flattenErrors(errors: Record<string, string[]> | undefined): string[] {
  if (!errors) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => messages)
    .map((message) => message.trim())
    .filter(Boolean);
}

type ApiErrorShape = {
  message?: string;
  errors?: Record<string, string[]>;
};

function hasApiErrorPayload(
  error: unknown,
): error is { apiError: ApiErrorShape } {
  return (
    typeof error === "object" &&
    error !== null &&
    "apiError" in error &&
    typeof (error as { apiError?: unknown }).apiError === "object" &&
    (error as { apiError?: unknown }).apiError !== null
  );
}

export function getErrorMessage(error: unknown, fallback = "An error occurred."): string {
  if (!hasApiErrorPayload(error)) {
    return fallback;
  }

  const fieldErrors = flattenErrors(error.apiError.errors);
  if (fieldErrors.length > 0) {
    return fieldErrors[0];
  }

  return error.apiError.message?.trim() || fallback;
}
