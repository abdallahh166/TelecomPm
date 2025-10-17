using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Enums;

namespace TelecomPM.Domain.Interfaces.Repositories;

// Material Repository
public interface IMaterialRepository : IRepository<Material, Guid>
{
    Task<Material?> GetByCodeAsync(string materialCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Material>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Material>> GetLowStockItemsAsync(Guid officeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Material>> GetByCategoryAsync(MaterialCategory category, CancellationToken cancellationToken = default);
    Task UpdateStockAsync(Guid materialId, decimal quantity, CancellationToken cancellationToken = default);
}