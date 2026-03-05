namespace TowerOps.Api.Contracts.Visits;

using System;
using System.ComponentModel.DataAnnotations;

public class ScheduledVisitsQueryParameters
{
    private const int MaxPageSize = 100;
    private int pageSize = 25;

    [Required]
    public DateTime Date { get; init; } = DateTime.UtcNow.Date;

    public Guid? EngineerId { get; init; }

    [Range(1, int.MaxValue)]
    public int Page { get; init; } = 1;

    [Range(1, MaxPageSize)]
    public int PageSize
    {
        get => pageSize;
        init => pageSize = Math.Clamp(value, 1, MaxPageSize);
    }
}

