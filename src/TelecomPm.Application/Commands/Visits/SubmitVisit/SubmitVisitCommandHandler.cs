﻿
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TelecomPM.Application.Common;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Interfaces.Repositories;
using TelecomPM.Domain.Services;

namespace TelecomPM.Application.Commands.Visits.SubmitVisit;

public class SubmitVisitCommandHandler : IRequestHandler<SubmitVisitCommand, Result>
{
    private readonly IVisitRepository _visitRepository;
    private readonly ISiteRepository _siteRepository;
    private readonly IVisitValidationService _validationService;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitVisitCommandHandler(
        IVisitRepository visitRepository,
        ISiteRepository siteRepository,
        IVisitValidationService validationService,
        IUnitOfWork unitOfWork)
    {
        _visitRepository = visitRepository;
        _siteRepository = siteRepository;
        _validationService = validationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SubmitVisitCommand request, CancellationToken cancellationToken)
    {
        var visit = await _visitRepository.GetByIdAsync(request.VisitId, cancellationToken);
        if (visit == null)
            return Result.Failure("Visit not found");

        var site = await _siteRepository.GetByIdAsync(visit.SiteId, cancellationToken);
        if (site == null)
            return Result.Failure("Site not found");

        // Validate visit completion
        var validationResult = _validationService.ValidateVisitCompletion(visit, site);
        if (!validationResult.IsValid)
        {
            var errors = string.Join(", ", validationResult.Errors.SelectMany(e => e.Value));
            return Result.Failure($"Visit validation failed: {errors}");
        }

        try
        {
            visit.Submit();

            _visitRepository.Update(visit);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (DomainException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}