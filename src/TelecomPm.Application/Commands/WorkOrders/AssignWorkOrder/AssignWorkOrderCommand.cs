namespace TelecomPM.Application.Commands.WorkOrders.AssignWorkOrder;

using TelecomPM.Application.Common;
using TelecomPM.Application.DTOs.WorkOrders;

public record AssignWorkOrderCommand : ICommand<WorkOrderDto>
{
    public Guid WorkOrderId { get; init; }
    public Guid EngineerId { get; init; }
    public string EngineerName { get; init; } = string.Empty;
    public string AssignedBy { get; init; } = string.Empty;
}
