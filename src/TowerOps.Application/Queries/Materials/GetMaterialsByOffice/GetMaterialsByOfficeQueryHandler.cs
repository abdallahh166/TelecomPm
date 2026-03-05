namespace TowerOps.Application.Queries.Materials.GetMaterialsByOffice;

using AutoMapper;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Materials;
using TowerOps.Domain.Interfaces.Repositories;
using TowerOps.Domain.Specifications.MaterialSpecifications;

public class GetMaterialsByOfficeQueryHandler : IRequestHandler<GetMaterialsByOfficeQuery, Result<PaginatedList<MaterialDto>>>
{
    private readonly IMaterialRepository _materialRepository;
    private readonly IMapper _mapper;

    public GetMaterialsByOfficeQueryHandler(
        IMaterialRepository materialRepository,
        IMapper mapper)
    {
        _materialRepository = materialRepository;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<MaterialDto>>> Handle(GetMaterialsByOfficeQuery request, CancellationToken cancellationToken)
    {
        var safePage = request.Page < 1 ? 1 : request.Page;
        var safePageSize = Math.Clamp(request.PageSize, 1, 100);
        var skip = (safePage - 1) * safePageSize;
        var onlyInStock = request.OnlyInStock ?? false;

        var countSpec = new MaterialsByOfficeSpecification(request.OfficeId, onlyInStock);
        var totalCount = await _materialRepository.CountAsync(countSpec, cancellationToken);

        var pagedSpec = new MaterialsByOfficeSpecification(request.OfficeId, onlyInStock, skip, safePageSize);
        var materials = await _materialRepository.FindAsNoTrackingAsync(pagedSpec, cancellationToken);

        var dtos = _mapper.Map<List<MaterialDto>>(materials);
        var paged = new PaginatedList<MaterialDto>(dtos, totalCount, safePage, safePageSize);
        return Result.Success(paged);
    }
}

