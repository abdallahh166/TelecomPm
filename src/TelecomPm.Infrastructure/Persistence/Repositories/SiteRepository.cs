namespace TelecomPM.Infrastructure.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Interfaces.Repositories;

public class SiteRepository : Repository<Site, Guid>, ISiteRepository
{
    public SiteRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Site?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.TowerInfo)
            .Include(s => s.PowerSystem)
            .Include(s => s.RadioEquipment)
            .Include(s => s.Transmission)
            .Include(s => s.CoolingSystem)
            .Include(s => s.FireSafety)
            .Include(s => s.SharingInfo)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Site?> GetBySiteCodeAsync(
        string siteCode,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(s => s.TowerInfo)
            .Include(s => s.PowerSystem)
            .Include(s => s.RadioEquipment)
            .Include(s => s.Transmission)
            .Include(s => s.CoolingSystem)
            .Include(s => s.FireSafety)
            .Include(s => s.SharingInfo)
            .FirstOrDefaultAsync(s => s.SiteCode.Value == siteCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Site>> GetByOfficeIdAsync(
        Guid officeId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.OfficeId == officeId)
            .OrderBy(s => s.SiteCode.Value)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Site>> GetByEngineerIdAsync(
        Guid engineerId,
        CancellationToken cancellationToken = default)
    {
        // This requires User entity to get assigned sites
        // For now, return empty list - will be implemented when User is loaded
        return await Task.FromResult(new List<Site>().AsReadOnly());
    }

    public async Task<IReadOnlyList<Site>> GetByComplexityAsync(
        SiteComplexity complexity,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(s => s.Complexity == complexity)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Site>> GetSitesNeedingMaintenanceAsync(
        int daysThreshold,
        CancellationToken cancellationToken = default)
    {
        var thresholdDate = DateTime.UtcNow.AddDays(-daysThreshold);

        return await _dbSet
            .Where(s => s.Status == SiteStatus.OnAir &&
                       (!s.LastVisitDate.HasValue || s.LastVisitDate.Value <= thresholdDate))
            .OrderBy(s => s.LastVisitDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsSiteCodeUniqueAsync(
        string siteCode,
        CancellationToken cancellationToken = default)
    {
        return !await _dbSet.AnyAsync(s => s.SiteCode.Value == siteCode, cancellationToken);
    }
}