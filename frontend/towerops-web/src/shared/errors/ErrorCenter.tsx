/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { ApiError } from "../../core/http/apiTypes";
import { setApiErrorListener } from "../../core/http/apiClient";

type ErrorCenterValue = {
  error: ApiError | null;
  reportError: (error: ApiError) => void;
  clearError: () => void;
};

const ErrorCenterContext = createContext<ErrorCenterValue | undefined>(undefined);

export function ErrorCenterProvider({ children }: PropsWithChildren) {
  const [error, setError] = useState<ApiError | null>(null);

  const reportError = useCallback((nextError: ApiError) => {
    setError(nextError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    setApiErrorListener(reportError);
    return () => {
      setApiErrorListener(null);
    };
  }, [reportError]);

  const value = useMemo<ErrorCenterValue>(
    () => ({
      error,
      reportError,
      clearError,
    }),
    [clearError, error, reportError],
  );

  return <ErrorCenterContext.Provider value={value}>{children}</ErrorCenterContext.Provider>;
}

export function useErrorCenter(): ErrorCenterValue {
  const value = useContext(ErrorCenterContext);
  if (!value) {
    throw new Error("useErrorCenter must be used within ErrorCenterProvider");
  }

  return value;
}
