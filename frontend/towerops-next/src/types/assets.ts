export type AssetServiceRecord = {
  id: string;
  servicedAtUtc: string;
  serviceType: string;
  engineerId?: string | null;
  notes?: string | null;
  visitId?: string | null;
};

export type Asset = {
  id: string;
  assetCode: string;
  siteCode: string;
  type: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  status: string;
  installedAtUtc: string;
  warrantyExpiresAtUtc?: string | null;
  lastServicedAtUtc?: string | null;
  replacedAtUtc?: string | null;
  replacedByAssetId?: string | null;
  serviceHistory: AssetServiceRecord[];
};

export type RecordAssetServicePayload = {
  serviceType: string;
  engineerId?: string;
  visitId?: string;
  notes?: string;
};

export type MarkAssetFaultyPayload = {
  reason?: string;
  engineerId?: string;
};

export type ReplaceAssetPayload = {
  newAssetId: string;
};
