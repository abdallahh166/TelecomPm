using TelecomPM.Domain.Entities.Offices;

namespace TelecomPM.Domain.Interfaces.Repositories;

// Office Repository
public interface IOfficeRepository : IRepository<Office, Guid>
{
    Task<Office?> GetByCodeAsync(string officeCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Office>> GetByRegionAsync(string region, CancellationToken cancellationToken = default);
    Task<bool> IsOfficeCodeUniqueAsync(string officeCode, CancellationToken cancellationToken = default);
}
