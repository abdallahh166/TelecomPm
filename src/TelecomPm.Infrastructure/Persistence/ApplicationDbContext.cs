﻿namespace TelecomPM.Infrastructure.Persistence;

using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;
using TelecomPM.Application.Common.Events;
using TelecomPM.Domain.Common;
using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Entities.Offices;
using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Entities.Users;
using TelecomPM.Domain.Entities.Visits;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Visit Aggregates
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<VisitPhoto> VisitPhotos => Set<VisitPhoto>();
    public DbSet<VisitReading> VisitReadings => Set<VisitReading>();
    public DbSet<VisitChecklist> VisitChecklists => Set<VisitChecklist>();
    public DbSet<VisitMaterialUsage> VisitMaterialUsages => Set<VisitMaterialUsage>();
    public DbSet<VisitIssue> VisitIssues => Set<VisitIssue>();
    public DbSet<VisitApproval> VisitApprovals => Set<VisitApproval>();

    // Site Aggregates
    public DbSet<Site> Sites => Set<Site>();
    public DbSet<SiteTowerInfo> SiteTowerInfos => Set<SiteTowerInfo>();
    public DbSet<SitePowerSystem> SitePowerSystems => Set<SitePowerSystem>();
    public DbSet<SiteRadioEquipment> SiteRadioEquipments => Set<SiteRadioEquipment>();
    public DbSet<SiteTransmission> SiteTransmissions => Set<SiteTransmission>();
    public DbSet<SiteCoolingSystem> SiteCoolingSystems => Set<SiteCoolingSystem>();
    public DbSet<SiteFireSafety> SiteFireSafeties => Set<SiteFireSafety>();
    public DbSet<SiteSharing> SiteSharings => Set<SiteSharing>();

    // User & Office
    public DbSet<User> Users => Set<User>();
    public DbSet<Office> Offices => Set<Office>();

    // Material
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<MaterialTransaction> MaterialTransactions => Set<MaterialTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global query filters (soft delete)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(Entity<Guid>).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var body = Expression.Equal(
                    Expression.Property(parameter, nameof(Entity<Guid>.IsDeleted)),
                    Expression.Constant(false));
                var lambda = Expression.Lambda(body, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events before saving
        await DispatchDomainEventsAsync(cancellationToken);

        return await base.SaveChangesAsync(cancellationToken);
    }

    private async Task DispatchDomainEventsAsync(CancellationToken cancellationToken)
    {
        var domainEntities = ChangeTracker
            .Entries<AggregateRoot<Guid>>()
            .Where(x => x.Entity.DomainEvents.Any())
            .Select(x => x.Entity)
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(x => x.DomainEvents)
            .ToList();

        domainEntities.ForEach(entity => entity.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
        {
            // ✅ Create wrapper notification
            var notificationType = typeof(DomainEventNotification<>)
                .MakeGenericType(domainEvent.GetType());

            var notification = Activator.CreateInstance(notificationType, domainEvent);

            if (notification != null)
            {
                await Publisher.Publish(notification, cancellationToken);
            }
        }
    }

    // Will be injected via DI
    public IPublisher Publisher { get; set; } = null!;
}