namespace TowerOps.Application.Queries.Users.GetUsersByOffice;

using AutoMapper;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TowerOps.Application.Common;
using TowerOps.Application.DTOs.Users;
using TowerOps.Domain.Interfaces.Repositories;
using TowerOps.Domain.Specifications.UserSpecifications;

public class GetUsersByOfficeQueryHandler : IRequestHandler<GetUsersByOfficeQuery, Result<PaginatedList<UserDto>>>
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public GetUsersByOfficeQueryHandler(
        IUserRepository userRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<UserDto>>> Handle(GetUsersByOfficeQuery request, CancellationToken cancellationToken)
    {
        var safePage = request.Page < 1 ? 1 : request.Page;
        var safePageSize = Math.Clamp(request.PageSize, 1, 100);
        var skip = (safePage - 1) * safePageSize;
        var onlyActive = request.OnlyActive ?? true;

        var countSpec = new UsersByOfficeSpecification(request.OfficeId, onlyActive);
        var totalCount = await _userRepository.CountAsync(countSpec, cancellationToken);

        var pagedSpec = new UsersByOfficeSpecification(request.OfficeId, onlyActive, skip, safePageSize);
        var users = await _userRepository.FindAsNoTrackingAsync(pagedSpec, cancellationToken);

        var dtos = _mapper.Map<List<UserDto>>(users);
        var paged = new PaginatedList<UserDto>(dtos, totalCount, safePage, safePageSize);
        return Result.Success(paged);
    }
}

