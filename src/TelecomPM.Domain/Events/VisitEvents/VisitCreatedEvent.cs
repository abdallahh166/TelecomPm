namespace TelecomPM.Domain.Events.VisitEvents
{
    public sealed record VisitCreatedEvent(
        Guid VisitId,
        Guid SiteId,
        Guid EngineerId,
        DateTime ScheduledDate
    ) : DomainEvent;
}
