namespace TelecomPM.Application.Commands.Visits.RejectVisit;

using MediatR;
using System.Threading;
using System.Threading.Tasks;
using TelecomPM.Application.Common;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Interfaces.Repositories;

public class RejectVisitCommandHandler : IRequestHandler<RejectVisitCommand, Result>
{
    private readonly IVisitRepository _visitRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectVisitCommandHandler(
        IVisitRepository visitRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _visitRepository = visitRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RejectVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _visitRepository.GetByIdAsync(request.VisitId, cancellationToken);
        if (visit == null)
            return Result.Failure("Visit not found");

        var reviewer = await _userRepository.GetByIdAsync(request.ReviewerId, cancellationToken);
        if (reviewer == null)
            return Result.Failure("Reviewer not found");

        if (reviewer.Role != UserRole.Manager && reviewer.Role != UserRole.Admin)
            return Result.Failure("Only managers or admins can reject visits");

        try
        {
            visit.Reject(reviewer.Id, reviewer.Name, request.RejectionReason);

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