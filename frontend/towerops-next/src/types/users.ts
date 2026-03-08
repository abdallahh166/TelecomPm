export type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  officeId: string;
  officeName: string;
  isActive: boolean;
  assignedSitesCount?: number | null;
  maxAssignedSites?: number | null;
  performanceRating?: number | null;
};

export type UserDetail = User & {
  specializations: string[];
  assignedSiteIds: string[];
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type UserPerformance = {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  assignedSitesCount: number;
  maxAssignedSites?: number | null;
  totalVisits: number;
  completedVisits: number;
  approvedVisits: number;
  rejectedVisits: number;
  onTimeVisits: number;
  completionRate: number;
  approvalRate: number;
  onTimeRate: number;
  performanceRating?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  officeId: string;
  maxAssignedSites?: number;
  specializations?: string[];
};

export type UpdateUserPayload = {
  name: string;
  phoneNumber: string;
  maxAssignedSites?: number;
  specializations?: string[];
};

export type ChangeUserRolePayload = {
  newRole: string;
};

export type UserListFilters = {
  onlyActive?: boolean;
  pageSize?: number;
};

export type UserRoleFilters = {
  officeId?: string;
  pageSize?: number;
};
