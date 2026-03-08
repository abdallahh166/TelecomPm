namespace TowerOps.Application.Queries.WorkOrders.GetWorkOrders;

using TowerOps.Application.Common;
using TowerOps.Application.DTOs.WorkOrders;

public record GetWorkOrdersQuery : IQuery<PaginatedList<WorkOrderDto>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}
