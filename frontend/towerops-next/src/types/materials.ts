export type MaterialUnit = 'Pieces' | 'Meters' | 'Kilograms' | 'Liters' | 'Set' | 'Box';

export type MaterialCategory =
  | 'Cable'
  | 'Electrical'
  | 'Cooling'
  | 'Power'
  | 'Transmission'
  | 'Safety'
  | 'Cleaning'
  | 'Tools'
  | 'Other';

export type Material = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: MaterialCategory;
  currentStock: number;
  unit: string;
  minimumStock: number;
  unitCost: number;
  currency: string;
  isLowStock: boolean;
  isActive: boolean;
};

export type MaterialTransaction = {
  id: string;
  materialId: string;
  visitId?: string | null;
  type: string;
  quantity: number;
  unit: string;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  transactionDate: string;
  performedBy: string;
};

export type MaterialReservation = {
  id: string;
  materialId: string;
  visitId: string;
  quantity: number;
  unit: string;
  reservedAt: string;
  isConsumed: boolean;
};

export type MaterialDetail = Material & {
  supplier?: string | null;
  lastRestockDate?: string | null;
  reorderQuantity?: number | null;
  recentTransactions: MaterialTransaction[];
  activeReservations: MaterialReservation[];
};

export type MaterialFilters = {
  onlyInStock?: boolean;
  pageSize?: number;
};

export type AddMaterialStockPayload = {
  quantity: number;
  unit: MaterialUnit;
  supplier?: string;
};

export type ReserveMaterialStockPayload = {
  visitId: string;
  quantity: number;
  unit: MaterialUnit;
};

export type ConsumeMaterialStockPayload = {
  visitId: string;
};

export type CreateMaterialPayload = {
  code: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  officeId: string;
  initialStock: number;
  unit: MaterialUnit;
  minimumStock: number;
  unitCost: number;
  supplier?: string;
};
