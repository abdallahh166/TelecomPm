namespace TowerOps.Application.Queries.WorkOrders.GetWorkOrders;

using AutoMapper;
using MediatR;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.WorkOrders;
using TowerOps.Domain.Interfaces.Repositories;
using TowerOps.Domain.Specifications.WorkOrderSpecifications;

public sealed class GetWorkOrdersQueryHandler : IRequestHandler<GetWorkOrdersQuery, Result<PaginatedList<WorkOrderDto>>>
{
    private readonly IMapper _mapper;
    private readonly IWorkOrderRepository _workOrderRepository;

    public GetWorkOrdersQueryHandler(IWorkOrderRepository workOrderRepository, IMapper mapper)
    {
        _workOrderRepository = workOrderRepository;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<WorkOrderDto>>> Handle(GetWorkOrdersQuery request, CancellationToken cancellationToken)
    {
        var safePage = request.Page < 1 ? 1 : request.Page;
        var safePageSize = Math.Clamp(request.PageSize, 1, 100);
        var skip = (safePage - 1) * safePageSize;

        var countSpec = new WorkOrdersPagedSpecification();
        var totalCount = await _workOrderRepository.CountAsync(countSpec, cancellationToken);

        var pagedSpec = new WorkOrdersPagedSpecification(skip, safePageSize);
        var workOrders = await _workOrderRepository.FindAsNoTrackingAsync(pagedSpec, cancellationToken);

        var dtos = _mapper.Map<List<WorkOrderDto>>(workOrders);
        var paged = new PaginatedList<WorkOrderDto>(dtos, totalCount, safePage, safePageSize);

        return Result.Success(paged);
    }
}
