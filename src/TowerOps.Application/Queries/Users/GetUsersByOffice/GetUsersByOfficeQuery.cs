namespace TowerOps.Application.Queries.Users.GetUsersByOffice;

using System;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Users;

public record GetUsersByOfficeQuery : IQuery<PaginatedList<UserDto>>
{
    public Guid OfficeId { get; init; }
    public bool? OnlyActive { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}

