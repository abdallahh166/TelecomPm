using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs;
using TowerOps.Application.Common.Interfaces;

namespace TowerOps.Infrastructure.Services;

public sealed class UploadScanHostedService : BackgroundService
{
    private const int DefaultIntervalSeconds = 60;
    private static readonly TimeSpan BlobConfigWarningInterval = TimeSpan.FromMinutes(10);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<UploadScanHostedService> _logger;
    private readonly IConfiguration _configuration;
    private DateTimeOffset _lastBlobWarningAt = DateTimeOffset.MinValue;

    public UploadScanHostedService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<UploadScanHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Upload scan hosted service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = TimeSpan.FromSeconds(DefaultIntervalSeconds);

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var settings = scope.ServiceProvider.GetRequiredService<ISystemSettingsService>();

                var isEnabled = await settings.GetAsync(
                    "UploadSecurity:Scan:Enabled",
                    true,
                    stoppingToken);

                var intervalSeconds = await settings.GetAsync(
                    "UploadSecurity:Scan:IntervalSeconds",
                    DefaultIntervalSeconds,
                    stoppingToken);

                delay = TimeSpan.FromSeconds(Math.Clamp(intervalSeconds, 10, 3600));

                if (isEnabled)
                {
                    if (!TryValidateBlobConfiguration(out var validationError))
                    {
                        LogBlobWarning(validationError);
                        delay = TimeSpan.FromMinutes(5);
                        continue;
                    }

                    var processor = scope.ServiceProvider.GetRequiredService<UploadScanProcessor>();
                    var processed = await processor.EvaluateBatchAsync(stoppingToken);
                    _logger.LogDebug("Upload scan cycle completed. Processed={ProcessedCount}", processed);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upload scan cycle failed.");
            }

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("Upload scan hosted service stopped.");
    }

    private bool TryValidateBlobConfiguration(out string error)
    {
        var connectionString = _configuration["AzureBlobStorage:ConnectionString"];

        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = _configuration.GetConnectionString("AzureBlobStorage");

        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = _configuration.GetConnectionString("AzureStorage");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            error = "Azure Blob Storage connection string is missing.";
            return false;
        }

        try
        {
            _ = new BlobServiceClient(connectionString);
            error = string.Empty;
            return true;
        }
        catch (Exception ex) when (ex is ArgumentException || ex is FormatException)
        {
            error = $"Azure Blob Storage connection string is invalid: {ex.Message}";
            return false;
        }
    }

    private void LogBlobWarning(string message)
    {
        var now = DateTimeOffset.UtcNow;
        if (now - _lastBlobWarningAt < BlobConfigWarningInterval)
            return;

        _lastBlobWarningAt = now;
        _logger.LogWarning(
            "Upload scan skipped because storage is not ready. {Reason} Configure AzureBlobStorage before enabling upload scan.",
            message);
    }
}
