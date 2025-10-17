using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Enums;

namespace TelecomPM.Domain.Interfaces.Repositories;

// Site Repository
public interface ISiteRepository : IRepository<Site, Guid>
{
    Task<Site?> GetBySiteCodeAsync(string siteCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Site>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Site>> GetByEngineerIdAsync(Guid engineerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Site>> GetByComplexityAsync(SiteComplexity complexity, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Site>> GetSitesNeedingMaintenanceAsync(int daysThreshold, CancellationToken cancellationToken = default);
    Task<bool> IsSiteCodeUniqueAsync(string siteCode, CancellationToken cancellationToken = default);
}