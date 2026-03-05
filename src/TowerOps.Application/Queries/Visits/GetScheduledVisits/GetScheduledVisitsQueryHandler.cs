namespace TowerOps.Application.Queries.Visits.GetScheduledVisits;

using AutoMapper;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Visits;
using TowerOps.Domain.Interfaces.Repositories;
using TowerOps.Domain.Specifications.VisitSpecifications;

public class GetScheduledVisitsQueryHandler : IRequestHandler<GetScheduledVisitsQuery, Result<PaginatedList<VisitDto>>>
{
    private readonly IVisitRepository _visitRepository;
    private readonly IMapper _mapper;

    public GetScheduledVisitsQueryHandler(IVisitRepository visitRepository, IMapper mapper)
    {
        _visitRepository = visitRepository;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<VisitDto>>> Handle(GetScheduledVisitsQuery request, CancellationToken cancellationToken)
    {
        var safePage = request.Page < 1 ? 1 : request.Page;
        var safePageSize = Math.Clamp(request.PageSize, 1, 100);
        var skip = (safePage - 1) * safePageSize;

        var countSpec = new ScheduledVisitsForDateSpecification(request.Date, request.EngineerId);
        var totalCount = await _visitRepository.CountAsync(countSpec, cancellationToken);

        var pagedSpec = new ScheduledVisitsForDateSpecification(request.Date, request.EngineerId, skip, safePageSize);
        var visits = await _visitRepository.FindAsNoTrackingAsync(pagedSpec, cancellationToken);

        var dtos = _mapper.Map<List<VisitDto>>(visits);
        var paged = new PaginatedList<VisitDto>(dtos, totalCount, safePage, safePageSize);
        return Result.Success(paged);
    }
}
