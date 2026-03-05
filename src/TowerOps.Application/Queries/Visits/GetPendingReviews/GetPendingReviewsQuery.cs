namespace TowerOps.Application.Queries.Visits.GetPendingReviews;

using System;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Visits;

public record GetPendingReviewsQuery : IQuery<PaginatedList<VisitDto>>
{
    public Guid? OfficeId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}
