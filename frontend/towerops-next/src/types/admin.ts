export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type OfficeItem = {
  id: string;
  name: string;
  region: string;
  isActive: boolean;
};

export type RoleItem = {
  id: string;
  name: string;
  usersCount: number;
};

export type SettingItem = {
  key: string;
  value: string;
  group: string;
};
