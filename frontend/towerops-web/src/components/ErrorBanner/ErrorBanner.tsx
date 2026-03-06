import { useState, useEffect } from "react";
import { ApiRequestError } from "../../services/errorAdapter";
import { setApiErrorListener } from "../../services/api/axiosInstance";
import { Button } from "../Button/Button";
import { t } from "../../i18n";

export function ErrorBanner() {
  const [error, setError] = useState<ApiRequestError | null>(null);

  useEffect(() => {
    setApiErrorListener((err: ApiRequestError) => {
      setError(err);
    });
    return () => setApiErrorListener(null);
  }, []);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-[960px] mx-4 rounded-xl border border-red/50 bg-red/10 text-red-100 px-4 py-3 flex items-center justify-between gap-4 shadow-lg"
    >
      <div>
        <p className="font-medium">{error.apiError.message}</p>
        <p className="font-mono text-xs text-red-200/80 mt-1">
          {error.apiError.correlationId}
        </p>
      </div>
      <Button
        variant="outline"
        className="border-red-200/50 text-red-100"
        onClick={() => setError(null)}
      >
        {t("error.dismiss")}
      </Button>
    </div>
  );
}
