import type { PaginationMetadata } from "../../core/http/apiTypes";
import { apiClient } from "../../core/http/apiClient";
import { buildQuery, defaultPagination } from "./common";

export const VISIT_STATUSES = [
  "Scheduled",
  "InProgress",
  "CheckedIn",
  "Completed",
  "Submitted",
  "UnderReview",
  "NeedsCorrection",
  "Approved",
  "Rejected",
  "Cancelled",
] as const;

export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_TYPES = ["PM", "CM", "BM", "Other"] as const;

export type VisitType = (typeof VISIT_TYPES)[number];

export type VisitDto = {
  id: string;
  visitNumber: string;
  siteId: string;
  siteCode: string;
  siteName: string;
  engineerId: string;
  engineerName: string;
  supervisorName?: string;
  technicianNames: string[];
  scheduledDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  engineerReportedCompletionTimeUtc?: string;
  duration?: string;
  status: VisitStatus;
  type: VisitType;
  completionPercentage: number;
  canBeEdited: boolean;
  canBeSubmitted: boolean;
  engineerNotes?: string;
  reviewerNotes?: string;
  createdAt: string;
};

export type VisitPhotoDto = {
  id: string;
  visitId: string;
  caption?: string;
  uploadedAtUtc: string;
  blobUrl?: string;
};

export type VisitReadingDto = {
  id: string;
  parameterName: string;
  value: string;
  unit?: string;
  recordedAtUtc: string;
};

export type VisitChecklistDto = {
  id: string;
  templateItemId: string;
  label: string;
  result?: string;
  notes?: string;
  completedAtUtc?: string;
};

export type VisitMaterialUsageDto = {
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
};

export type VisitIssueDto = {
  id: string;
  severity: string;
  description: string;
  reportedAtUtc: string;
  resolvedAtUtc?: string;
};

export type VisitApprovalDto = {
  id: string;
  action: string;
  performedBy: string;
  performedAtUtc: string;
  notes?: string;
};

export type VisitDetailDto = VisitDto & {
  photos: VisitPhotoDto[];
  readings: VisitReadingDto[];
  checklists: VisitChecklistDto[];
  materialsUsed: VisitMaterialUsageDto[];
  issuesFound: VisitIssueDto[];
  approvalHistory: VisitApprovalDto[];
};

export type CreateVisitRequest = {
  siteId: string;
  engineerId: string;
  scheduledDate: string;
  type: VisitType;
  technicianIds?: string[];
};

export type StartVisitRequest = {
  actualStartTimeUtc: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInLocationDescription?: string;
};

export type CheckInVisitRequest = {
  checkInLatitude: number;
  checkInLongitude: number;
  checkInLocationDescription?: string;
};

export type CheckOutVisitRequest = {
  checkOutLatitude: number;
  checkOutLongitude: number;
  checkOutLocationDescription?: string;
};

export type ApproveVisitRequest = {
  reviewerNotes?: string;
};

export type RejectVisitRequest = {
  reviewerNotes: string;
};

export type RequestCorrectionVisitRequest = {
  reviewerNotes: string;
};

export type EvidenceStatusDto = {
  visitId: string;
  hasSignature: boolean;
  photosCount: number;
  requiredPhotosCount: number;
  readingsCount: number;
  checklistsCompletedCount: number;
  checklistsTotalCount: number;
};

type PagedVisits = {
  items: VisitDto[];
  pagination: PaginationMetadata;
};

type EngineerVisitQuery = {
  pageNumber?: number;
  pageSize?: number;
  status?: VisitStatus;
  from?: string;
  to?: string;
};

type PendingReviewsQuery = {
  officeId?: string;
  page?: number;
  pageSize?: number;
};

type ScheduledVisitsQuery = {
  date: string;
  engineerId?: string;
  page?: number;
  pageSize?: number;
};

export const visitsApi = {
  async getById(visitId: string): Promise<VisitDetailDto> {
    const response = await apiClient.request<VisitDetailDto>(`/visits/${visitId}`);
    return response.data;
  },

  async getEngineerVisits(engineerId: string, query: EngineerVisitQuery): Promise<PagedVisits> {
    const response = await apiClient.request<VisitDto[]>(
      `/visits/engineers/${engineerId}${buildQuery({
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? 25,
        status: query.status,
        from: query.from,
        to: query.to,
      })}`,
    );
    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async getPendingReviews(query: PendingReviewsQuery): Promise<PagedVisits> {
    const response = await apiClient.request<VisitDto[]>(
      `/visits/pending-reviews${buildQuery({
        officeId: query.officeId,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
      })}`,
    );
    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async getScheduled(query: ScheduledVisitsQuery): Promise<PagedVisits> {
    const response = await apiClient.request<VisitDto[]>(
      `/visits/scheduled${buildQuery({
        date: query.date,
        engineerId: query.engineerId,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 25,
      })}`,
    );
    return {
      items: response.data,
      pagination: response.pagination ?? defaultPagination(),
    };
  },

  async getEvidenceStatus(visitId: string): Promise<EvidenceStatusDto> {
    const response = await apiClient.request<EvidenceStatusDto>(`/visits/${visitId}/evidence-status`);
    return response.data;
  },

  async create(request: CreateVisitRequest): Promise<VisitDetailDto> {
    const response = await apiClient.request<VisitDetailDto>("/visits", {
      method: "POST",
      body: request,
    });
    return response.data;
  },

  async start(visitId: string, request: StartVisitRequest): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/start`, {
      method: "POST",
      body: request,
    });
  },

  async checkIn(visitId: string, request: CheckInVisitRequest): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/checkin`, {
      method: "POST",
      body: request,
    });
  },

  async checkOut(visitId: string, request: CheckOutVisitRequest): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/checkout`, {
      method: "POST",
      body: request,
    });
  },

  async complete(visitId: string): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/complete`, {
      method: "POST",
    });
  },

  async submit(visitId: string): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/submit`, {
      method: "POST",
    });
  },

  async approve(visitId: string, request: ApproveVisitRequest = {}): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/approve`, {
      method: "POST",
      body: request,
    });
  },

  async reject(visitId: string, request: RejectVisitRequest): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/reject`, {
      method: "POST",
      body: request,
    });
  },

  async requestCorrection(visitId: string, request: RequestCorrectionVisitRequest): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/request-correction`, {
      method: "POST",
      body: request,
    });
  },

  async cancel(visitId: string): Promise<void> {
    await apiClient.request<void>(`/visits/${visitId}/cancel`, {
      method: "POST",
    });
  },
};
