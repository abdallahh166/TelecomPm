export type ApplicationRole = {
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
};

export type CreateRolePayload = {
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  permissions: string[];
};

export type UpdateRolePayload = {
  displayName: string;
  description?: string;
  isActive: boolean;
  permissions: string[];
};

export type RoleListFilters = {
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};
