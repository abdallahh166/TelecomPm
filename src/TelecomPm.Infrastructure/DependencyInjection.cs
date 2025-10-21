namespace TelecomPM.Infrastructure;

using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TelecomPM.Application.Common.Interfaces;
using TelecomPM.Domain.Interfaces.Repositories;
using TelecomPM.Infrastructure.Persistence;
using TelecomPM.Infrastructure.Persistence.Repositories;
using TelecomPM.Infrastructure.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database - Register without custom factory first
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // ✅ Fix: Inject IPublisher into DbContext via property injection
        services.AddScoped(provider =>
        {
            var context = provider.GetRequiredService<ApplicationDbContext>();
            context.Publisher = provider.GetRequiredService<IPublisher>();
            return context;
        });

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<IVisitRepository, VisitRepository>();
        services.AddScoped<ISiteRepository, SiteRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOfficeRepository, OfficeRepository>();
        services.AddScoped<IMaterialRepository, MaterialRepository>();

        // Infrastructure Services
        services.AddScoped<IDateTimeService, DateTimeService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IFileStorageService, BlobStorageService>();

        // ✅ Fix: Register EmailService as IEmailService
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();

        services.AddScoped<IExcelExportService, ExcelExportService>();
        services.AddScoped<IReportGenerationService, ReportGenerationService>();

        // HttpContextAccessor for CurrentUserService
        services.AddHttpContextAccessor();

        return services;
    }
}