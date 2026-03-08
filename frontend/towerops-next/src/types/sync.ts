export type SyncStatusItem = {
  id: string;
  operationType: string;
  createdOnDeviceUtc: string;
  status: string;
  conflictReason?: string | null;
  retryCount: number;
};

export type SyncStatus = {
  deviceId: string;
  total: number;
  pending: number;
  processed: number;
  conflicts: number;
  failed: number;
  items: SyncStatusItem[];
};

export type SyncConflict = {
  id: string;
  syncQueueId: string;
  conflictType: string;
  resolution: string;
  resolvedAtUtc: string;
};

export type SyncBatchItemRequest = {
  operationType: string;
  payload: string;
  createdOnDeviceUtc: string;
};

export type SyncBatchRequest = {
  deviceId: string;
  engineerId?: string;
  items: SyncBatchItemRequest[];
};

export type SyncBatchResult = {
  processed: number;
  conflicts: number;
  failed: number;
  skipped: number;
};
