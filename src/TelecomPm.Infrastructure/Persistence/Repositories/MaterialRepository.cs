namespace TelecomPM.Infrastructure.Persistence.Repositories;

using Microsoft.EntityFrameworkCore;
using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Interfaces.Repositories;

public class MaterialRepository : Repository<Material, Guid>, IMaterialRepository
{
    public MaterialRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Material?> GetByCodeAsync(
        string materialCode,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(m => m.Code == materialCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Material>> GetByOfficeIdAsync(
        Guid officeId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.OfficeId == officeId && m.IsActive)
            .OrderBy(m => m.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Material>> GetLowStockItemsAsync(
        Guid officeId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.OfficeId == officeId &&
                       m.IsActive &&
                       m.CurrentStock.Value <= m.MinimumStock.Value)
            .OrderBy(m => m.CurrentStock.Value)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Material>> GetByCategoryAsync(
        MaterialCategory category,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.Category == category && m.IsActive)
            .OrderBy(m => m.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateStockAsync(
        Guid materialId,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        var material = await GetByIdAsync(materialId, cancellationToken);
        if (material == null)
            throw new InvalidOperationException($"Material with ID {materialId} not found");

        // Stock update is handled in domain
        await Task.CompletedTask;
    }
}