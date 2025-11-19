namespace TelecomPm.Api.Controllers;

using System;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TelecomPM.Application.Common;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected ApiControllerBase(ISender sender)
    {
        Sender = sender;
    }

    protected ISender Sender { get; }

    protected IActionResult HandleResult(Result result)
    {
        return result.IsSuccess
            ? NoContent()
            : HandleFailure(result);
    }

    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return result.Value is null
                ? NoContent()
                : Ok(result.Value);
        }

        return HandleFailure(result);
    }

    private IActionResult HandleFailure(Result result)
    {
        var statusCode = result.Error.Contains("not found", StringComparison.OrdinalIgnoreCase)
            ? StatusCodes.Status404NotFound
            : StatusCodes.Status400BadRequest;

        return Problem(
            title: "Request failed",
            detail: result.Error,
            statusCode: statusCode);
    }
}

