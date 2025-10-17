using TelecomPM.Domain.Events;

namespace TelecomPM.Domain.Events.MaterialEvents;

public sealed record MaterialUsedEvent(
    Guid VisitId,
    Guid MaterialId,
    decimal Quantity,
    decimal TotalCost) : DomainEvent;
