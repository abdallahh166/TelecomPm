export type VisitListItem = {
  id: string;
  visitNumber: string;
  siteId: string;
  siteCode: string;
  siteName: string;
  engineerId: string;
  engineerName: string;
  supervisorName?: string | null;
  technicianNames: string[];
  scheduledDate: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  engineerReportedCompletionTimeUtc?: string | null;
  duration?: string | null;
  status: string;
  type: string;
  completionPercentage: number;
  canBeEdited: boolean;
  canBeSubmitted: boolean;
  engineerNotes?: string | null;
  reviewerNotes?: string | null;
  createdAt: string;
};

export type VisitPhoto = {
  id: string;
  type: string;
  category: string;
  itemName: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  fileStatus: string;
  isPendingApproval: boolean;
  quarantineReason?: string | null;
  isMandatory: boolean;
  capturedAt: string;
};

export type VisitReading = {
  id: string;
  readingType: string;
  category: string;
  value: number;
  unit: string;
  minAcceptable?: number | null;
  maxAcceptable?: number | null;
  isWithinRange: boolean;
  phase?: string | null;
  equipment?: string | null;
  notes?: string | null;
  measuredAt: string;
};

export type VisitChecklist = {
  id: string;
  category: string;
  itemName: string;
  description: string;
  status: string;
  isMandatory: boolean;
  notes?: string | null;
  completedAt?: string | null;
};

export type VisitIssue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  reportedAt: string;
  resolvedAt?: string | null;
  resolution?: string | null;
  photoUrls: string[];
};

export type VisitMaterialUsage = {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  reason: string;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  status: string;
  usedAt: string;
};

export type VisitApproval = {
  id: string;
  reviewerName: string;
  action: string;
  comments?: string | null;
  reviewedAt: string;
};

export type VisitDetails = VisitListItem & {
  photos: VisitPhoto[];
  readings: VisitReading[];
  checklists: VisitChecklist[];
  materialsUsed: VisitMaterialUsage[];
  issuesFound: VisitIssue[];
  approvalHistory: VisitApproval[];
};

export type VisitEvidenceStatus = {
  visitId: string;
  beforePhotos: number;
  afterPhotos: number;
  requiredBeforePhotos: number;
  requiredAfterPhotos: number;
  readingsCount: number;
  requiredReadings: number;
  checklistItems: number;
  completedChecklistItems: number;
  completionPercentage: number;
  isPhotosComplete: boolean;
  isReadingsComplete: boolean;
  isChecklistComplete: boolean;
  canBeSubmitted: boolean;
};

export type ChecklistStatus = 'OK' | 'NOK' | 'NA';

export type IssueCategory =
  | 'Electrical'
  | 'Power'
  | 'Cooling'
  | 'Radio'
  | 'Transmission'
  | 'Generator'
  | 'Fire'
  | 'Structure'
  | 'Other';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type PhotoType = 'Before' | 'After' | 'During' | 'Material' | 'Issue';

export type PhotoCategory =
  | 'ShelterInside'
  | 'ShelterOutside'
  | 'Tower'
  | 'Fence'
  | 'GEDP'
  | 'Rectifier'
  | 'Batteries'
  | 'PowerMeter'
  | 'SurgeArrestor'
  | 'AirConditioner'
  | 'FirePanel'
  | 'FireExtinguisher'
  | 'BTS'
  | 'NodeB'
  | 'MW'
  | 'DDF'
  | 'EarthBar'
  | 'EarthRod'
  | 'CableTray'
  | 'Roxtec'
  | 'Generator'
  | 'PMLogbook'
  | 'Other';

export type AddChecklistItemPayload = {
  category: string;
  itemName: string;
  description: string;
  isMandatory: boolean;
};

export type UpdateChecklistItemPayload = {
  status: ChecklistStatus;
  notes?: string;
};

export type AddVisitIssuePayload = {
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  photoIds?: string[];
};

export type ResolveVisitIssuePayload = {
  resolution: string;
};

export type AddVisitReadingPayload = {
  readingType: string;
  category: string;
  value: number;
  unit: string;
  minAcceptable?: number;
  maxAcceptable?: number;
  phase?: string;
  equipment?: string;
  notes?: string;
};

export type UpdateVisitReadingPayload = {
  value: number;
};

export type AddVisitPhotoPayload = {
  type: PhotoType;
  category: PhotoCategory;
  itemName: string;
  file: File;
  description?: string;
  latitude?: number;
  longitude?: number;
};

export type CaptureVisitSignaturePayload = {
  signerName: string;
  signerRole: string;
  signatureDataBase64: string;
  signerPhone?: string;
  latitude?: number;
  longitude?: number;
};

export type VisitSignature = {
  signerName: string;
  signerRole: string;
  signatureDataBase64: string;
  signedAtUtc: string;
  signerPhone?: string;
  latitude?: number;
  longitude?: number;
};

export type ImportVisitEvidencePayload = {
  file: File;
};

export type StartVisitPayload = {
  latitude: number;
  longitude: number;
};

export type CheckInVisitPayload = {
  latitude: number;
  longitude: number;
};

export type CheckOutVisitPayload = {
  latitude: number;
  longitude: number;
};

export type CompleteVisitPayload = {
  engineerNotes?: string;
  engineerReportedCompletionTimeUtc?: string;
};

export type CancelVisitPayload = {
  reason: string;
};

export type EngineerVisitFilters = {
  status?: string;
  from?: string;
  to?: string;
};

export type ApproveVisitPayload = {
  notes?: string;
};

export type RejectVisitPayload = {
  rejectionReason: string;
};

export type RequestCorrectionPayload = {
  correctionNotes: string;
};

export type CreateVisitPayload = {
  siteId: string;
  engineerId: string;
  scheduledDate: string;
  type: string;
  supervisorId?: string;
  technicianNames?: string[];
};

export type RescheduleVisitPayload = {
  newScheduledDate: string;
  reason?: string;
};
