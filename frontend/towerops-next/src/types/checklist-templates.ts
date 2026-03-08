export type ChecklistTemplateItem = {
  id: string;
  checklistTemplateId: string;
  category: string;
  itemName: string;
  description?: string | null;
  isMandatory: boolean;
  orderIndex: number;
  applicableSiteTypes?: string | null;
  applicableVisitTypes?: string | null;
};

export type ChecklistTemplate = {
  id: string;
  visitType: string;
  version: string;
  isActive: boolean;
  effectiveFromUtc: string;
  effectiveToUtc?: string | null;
  createdBy: string;
  approvedBy?: string | null;
  approvedAtUtc?: string | null;
  changeNotes?: string | null;
  items: ChecklistTemplateItem[];
};

export type CreateChecklistTemplateItemPayload = {
  category: string;
  itemName: string;
  description?: string;
  isMandatory: boolean;
  orderIndex: number;
  applicableSiteTypes?: string;
  applicableVisitTypes?: string;
};

export type CreateChecklistTemplatePayload = {
  visitType: string;
  version: string;
  effectiveFromUtc: string;
  changeNotes?: string;
  createdBy: string;
  items: CreateChecklistTemplateItemPayload[];
};

export type ActivateChecklistTemplatePayload = {
  approvedBy: string;
};

export type ImportChecklistTemplatePayload = {
  file: File;
  visitType: string;
  version: string;
  effectiveFromUtc: string;
  createdBy: string;
  changeNotes?: string;
};

export type ImportChecklistTemplateResult = {
  importedCount: number;
  skippedCount: number;
  errors: string[];
};
