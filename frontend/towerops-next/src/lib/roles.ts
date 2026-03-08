export const ROLE_GROUPS = {
  ADMIN: ['Admin', 'Manager'],
  OPERATIONS: ['Admin', 'Manager', 'Supervisor'],
  ENGINEER: ['Admin', 'Manager', 'Supervisor', 'PMEngineer', 'Technician'],
  REVIEW: ['Admin', 'Manager', 'Supervisor'],
  INVENTORY: ['Admin', 'Manager', 'Supervisor', 'Technician'],
  PORTAL: ['Admin', 'Manager', 'Supervisor', 'PMEngineer', 'Technician'],
} as const;

function normalizeRole(role: string | undefined | null) {
  return (role ?? '').replace(/[\s_-]+/g, '').toLowerCase();
}

export function hasAnyRole(userRole: string | undefined, allowedRoles?: readonly string[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.some((role) => normalizeRole(role) === normalizedUserRole);
}
