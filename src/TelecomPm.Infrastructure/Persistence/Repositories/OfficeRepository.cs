namespace TelecomPM.Infrastructure.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TelecomPM.Domain.Entities.Offices;
using TelecomPM.Domain.Interfaces.Repositories;

public class OfficeRepository : Repository<Office, Guid>, IOfficeRepository
{
    public OfficeRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Office?> GetByCodeAsync(
        string officeCode,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(o => o.Code == officeCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Office>> GetByRegionAsync(
        string region,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(o => o.Region == region)
            .OrderBy(o => o.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsOfficeCodeUniqueAsync(
        string officeCode,
        CancellationToken cancellationToken = default)
    {
        return !await _dbSet.AnyAsync(o => o.Code == officeCode, cancellationToken);
    }
}