namespace TelecomPM.Application.Queries.WorkOrders.GetWorkOrderById;

using TelecomPM.Application.Common;
using TelecomPM.Application.DTOs.WorkOrders;

public record GetWorkOrderByIdQuery : IQuery<WorkOrderDto>
{
    public Guid WorkOrderId { get; init; }
}
