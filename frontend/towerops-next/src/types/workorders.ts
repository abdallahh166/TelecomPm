export type WorkOrderListItem = {
  id: string;
  woNumber: string;
  siteCode: string;
  officeCode: string;
  workOrderType: string;
  slaStartAtUtc: string;
  scheduledVisitDateUtc?: string | null;
  slaClass: string;
  scope: string;
  status: string;
  issueDescription: string;
  assignedEngineerId?: string | null;
  assignedEngineerName?: string | null;
  assignedAtUtc?: string | null;
  responseDeadlineUtc: string;
  resolutionDeadlineUtc: string;
};

export type WorkOrderDetails = WorkOrderListItem;

export type CreateWorkOrderPayload = {
  woNumber: string;
  siteCode: string;
  officeCode: string;
  workOrderType: string;
  scheduledVisitDateUtc?: string;
  slaClass: string;
  scope: string;
  issueDescription: string;
};

export type AssignWorkOrderPayload = {
  engineerId: string;
  engineerName: string;
  assignedBy: string;
};

export type CustomerAcceptWorkOrderPayload = {
  acceptedBy: string;
};

export type CustomerRejectWorkOrderPayload = {
  reason: string;
};

export type WorkOrderSignature = {
  signerName: string;
  signerRole: string;
  signatureDataBase64: string;
  signedAtUtc: string;
  signerPhone?: string;
  latitude?: number;
  longitude?: number;
};

export type WorkOrderSignatures = {
  clientSignature?: WorkOrderSignature | null;
  engineerSignature?: WorkOrderSignature | null;
};

export type CaptureWorkOrderSignaturePayload = {
  signerName: string;
  signerRole: string;
  signatureDataBase64: string;
  signerPhone?: string;
  latitude?: number;
  longitude?: number;
  isEngineerSignature: boolean;
};
