type EnumOption = {
  value: string;
  label: string;
};

export const SITE_TYPE_OPTIONS: readonly EnumOption[] = [
  { value: "Macro", label: "Macro" },
  { value: "Nodal", label: "Nodal" },
  { value: "BSC", label: "BSC" },
  { value: "VIP", label: "VIP" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Indoor", label: "Indoor" },
  { value: "Repeater", label: "Repeater" },
  { value: "MicroNano", label: "Micro/Nano" },
  { value: "GreenField", label: "Green Field" },
  { value: "RoofTop", label: "Roof Top" },
  { value: "BTS", label: "BTS" },
];

export const SITE_STATUS_OPTIONS: readonly EnumOption[] = [
  { value: "OnAir", label: "On Air" },
  { value: "OffAir", label: "Off Air" },
  { value: "UnderMaintenance", label: "Under Maintenance" },
  { value: "Decommissioned", label: "Decommissioned" },
];

export const SITE_COMPLEXITY_OPTIONS: readonly EnumOption[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export const TOWER_OWNERSHIP_OPTIONS: readonly EnumOption[] = [
  { value: "Host", label: "Host" },
  { value: "Guest", label: "Guest" },
  { value: "IndependentTower", label: "Independent Tower" },
];

export const ASSET_TYPE_OPTIONS: readonly EnumOption[] = [
  { value: "Rectifier", label: "Rectifier" },
  { value: "Battery", label: "Battery" },
  { value: "ACUnit", label: "AC Unit" },
  { value: "Generator", label: "Generator" },
  { value: "BTS", label: "BTS" },
  { value: "Antenna", label: "Antenna" },
  { value: "ODU", label: "ODU" },
  { value: "Router", label: "Router" },
];

export const MATERIAL_CATEGORY_OPTIONS: readonly EnumOption[] = [
  { value: "Cable", label: "Cable" },
  { value: "Electrical", label: "Electrical" },
  { value: "Cooling", label: "Cooling" },
  { value: "Power", label: "Power" },
  { value: "Transmission", label: "Transmission" },
  { value: "Safety", label: "Safety" },
  { value: "Cleaning", label: "Cleaning" },
  { value: "Tools", label: "Tools" },
  { value: "Other", label: "Other" },
];

export const MATERIAL_UNIT_OPTIONS: readonly EnumOption[] = [
  { value: "Pieces", label: "Pieces" },
  { value: "Meters", label: "Meters" },
  { value: "Kilograms", label: "Kilograms" },
  { value: "Liters", label: "Liters" },
  { value: "Set", label: "Set" },
  { value: "Box", label: "Box" },
];
