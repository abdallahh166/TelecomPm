import { useErrorCenter } from "./ErrorCenter";

export function ErrorBanner() {
  const { error, clearError } = useErrorCenter();

  if (!error) {
    return null;
  }

  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>{error.message}</strong>
        <div className="error-banner__meta">
          code={error.code} | correlationId={error.correlationId}
        </div>
      </div>
      <button
        className="error-banner__dismiss"
        type="button"
        onClick={clearError}
      >
        Dismiss
      </button>
    </div>
  );
}
