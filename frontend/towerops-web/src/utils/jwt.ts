function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(withPadding);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(payloadJson) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function extractPermissions(token: string): string[] {
  const payload = parseJwtPayload(token);
  if (!payload) return [];
  const raw = payload.permission;
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) return raw.filter((item): item is string => typeof item === "string");
  return [];
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function extractRole(token: string): string | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const rawRole = payload.role ?? payload[ROLE_CLAIM];
  return typeof rawRole === "string" ? rawRole : null;
}
