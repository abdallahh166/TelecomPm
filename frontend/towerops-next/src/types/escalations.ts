export type SlaClass = 'P1' | 'P2' | 'P3' | 'P4';

export type EscalationLevel = 'AreaManager' | 'BMManagement' | 'ProjectSponsor';

export type EscalationStatus = 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Closed';

export type Escalation = {
  id: string;
  workOrderId: string;
  incidentId: string;
  siteCode: string;
  slaClass: SlaClass;
  financialImpactEgp: number;
  slaImpactPercentage: number;
  evidencePackage: string;
  previousActions: string;
  recommendedDecision: string;
  level: EscalationLevel;
  status: EscalationStatus;
  submittedBy: string;
  submittedAtUtc: string;
};

export type CreateEscalationPayload = {
  workOrderId: string;
  incidentId: string;
  siteCode: string;
  slaClass: SlaClass;
  financialImpactEgp: number;
  slaImpactPercentage: number;
  evidencePackage: string;
  previousActions: string;
  recommendedDecision: string;
  level: EscalationLevel;
  submittedBy: string;
};
