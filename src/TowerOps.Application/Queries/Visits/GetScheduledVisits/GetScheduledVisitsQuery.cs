namespace TowerOps.Application.Queries.Visits.GetScheduledVisits;

using System;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Visits;

public record GetScheduledVisitsQuery : IQuery<PaginatedList<VisitDto>>
{
    public DateTime Date { get; init; }
    public Guid? EngineerId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}
