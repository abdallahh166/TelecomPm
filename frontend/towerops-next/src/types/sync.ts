export type SyncStatusItem = {
  deviceId: string;
  lastSyncedAtUtc: string;
  status: string;
};

export type SyncConflictItem = {
  id: string;
  entityType: string;
  entityId: string;
  conflictType: string;
  createdAtUtc: string;
};
