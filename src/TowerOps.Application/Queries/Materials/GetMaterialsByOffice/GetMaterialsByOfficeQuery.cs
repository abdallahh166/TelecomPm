namespace TowerOps.Application.Queries.Materials.GetMaterialsByOffice;

using System;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Materials;

public record GetMaterialsByOfficeQuery : IQuery<PaginatedList<MaterialDto>>
{
    public Guid OfficeId { get; init; }
    public bool? OnlyInStock { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}

