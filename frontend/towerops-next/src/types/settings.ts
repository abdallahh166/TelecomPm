export type SystemSetting = {
  key: string;
  value: string;
  group: string;
  dataType: string;
  description?: string | null;
  isEncrypted: boolean;
  updatedAtUtc: string;
  updatedBy: string;
};

export type UpsertSystemSettingPayload = {
  key: string;
  value: string;
  group: string;
  dataType: string;
  description?: string;
  isEncrypted: boolean;
};

export type SettingsListFilters = {
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

export type SettingsTestService = 'twilio' | 'email' | 'firebase';

export type SettingsTestResult = {
  message: string;
};
