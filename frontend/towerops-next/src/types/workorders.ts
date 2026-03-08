export type WorkOrderListItem = {
  workOrderId: string;
  siteCode: string;
  status: string;
  priority: string;
  slaDeadline: string;
  createdAt: string;
};

export type WorkOrderDetails = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  siteCode: string;
};
