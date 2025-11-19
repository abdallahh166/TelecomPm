namespace TelecomPm.Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TelecomPM.Application.Queries.Materials.GetLowStockMaterials;

public sealed class MaterialsController : ApiControllerBase
{
    public MaterialsController(ISender sender)
        : base(sender)
    {
    }

    [HttpGet("low-stock/{officeId:guid}")]
    public async Task<IActionResult> GetLowStockMaterials(Guid officeId, CancellationToken cancellationToken)
    {
        var result = await Sender.Send(
            new GetLowStockMaterialsQuery { OfficeId = officeId },
            cancellationToken);

        return HandleResult(result);
    }
}

