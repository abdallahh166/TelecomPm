namespace TelecomPM.Application;

using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TelecomPM.Application.Common.Behaviors;
using TelecomPM.Domain.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
        });

        // AutoMapper
        services.AddAutoMapper(assembly);

        // FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Pipeline Behaviors (Order matters!)
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

        // Domain Services
        services.AddScoped<IVisitNumberGeneratorService, VisitNumberGeneratorService>();
        services.AddScoped<ISiteAssignmentService, SiteAssignmentService>();
        services.AddScoped<IMaterialStockService, MaterialStockService>();
        services.AddScoped<IVisitValidationService, VisitValidationService>();
        services.AddScoped<IVisitDurationCalculatorService, VisitDurationCalculatorService>();
        services.AddScoped<IPhotoChecklistGeneratorService, PhotoChecklistGeneratorService>();

        return services;
    }
}