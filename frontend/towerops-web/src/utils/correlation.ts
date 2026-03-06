export const CORRELATION_HEADER_NAME = "X-Correlation-ID";

export function createCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const random = Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${random}`;
}
