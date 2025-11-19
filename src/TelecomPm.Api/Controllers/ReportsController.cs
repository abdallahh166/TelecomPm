namespace TelecomPm.Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TelecomPM.Application.Queries.Reports.GetVisitReport;

public sealed class ReportsController : ApiControllerBase
{
    public ReportsController(ISender sender)
        : base(sender)
    {
    }

    [HttpGet("visits/{visitId:guid}")]
    public async Task<IActionResult> GetVisitReport(Guid visitId, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(
            new GetVisitReportQuery { VisitId = visitId },
            cancellationToken);

        return HandleResult(result);
    }
}

