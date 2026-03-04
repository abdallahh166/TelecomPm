namespace TowerOps.Application.Queries.Users.GetUsersByRole;

using System;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Users;
using TowerOps.Domain.Enums;

public record GetUsersByRoleQuery : IQuery<PaginatedList<UserDto>>
{
    public UserRole Role { get; init; }
    public Guid? OfficeId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}

