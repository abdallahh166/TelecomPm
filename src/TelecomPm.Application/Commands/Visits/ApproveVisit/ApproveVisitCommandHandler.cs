namespace TelecomPM.Application.Commands.Visits.ApproveVisit;

using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TelecomPM.Application.Common;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Interfaces.Repositories;

public class ApproveVisitCommandHandler : IRequestHandler<ApproveVisitCommand, Result>
{
    private readonly IVisitRepository _visitRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISiteRepository _siteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveVisitCommandHandler(
        IVisitRepository visitRepository,
        IUserRepository userRepository,
        ISiteRepository siteRepository,
        IUnitOfWork unitOfWork)
    {
        _visitRepository = visitRepository;
        _userRepository = userRepository;
        _siteRepository = siteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ApproveVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _visitRepository.GetByIdAsync(request.VisitId, cancellationToken);
        if (visit == null)
            return Result.Failure("Visit not found");

        var reviewer = await _userRepository.GetByIdAsync(request.ReviewerId, cancellationToken);
        if (reviewer == null)
            return Result.Failure("Reviewer not found");

        if (reviewer.Role != UserRole.Manager && reviewer.Role != UserRole.Admin)
            return Result.Failure("Only managers or admins can approve visits");

        try
        {
            visit.Approve(reviewer.Id, reviewer.Name, request.Notes);

            // Update site last visit date
            var site = await _siteRepository.GetByIdAsync(visit.SiteId, cancellationToken);
            if (site != null)
            {
                site.RecordVisit(visit.ActualStartTime ?? DateTime.UtcNow);
                await _siteRepository.UpdateAsync(site, cancellationToken);
            }

            await _visitRepository.UpdateAsync(visit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (DomainException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}