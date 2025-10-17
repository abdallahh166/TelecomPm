using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Interfaces.Repositories;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Services;

public sealed class MaterialStockService : IMaterialStockService
{
    private readonly IMaterialRepository _materialRepository;

    public MaterialStockService(IMaterialRepository materialRepository)
    {
        _materialRepository = materialRepository;
    }

    public async Task<bool> IsStockAvailableAsync(
        Guid materialId, 
        MaterialQuantity requestedQuantity, 
        CancellationToken cancellationToken = default)
    {
        var material = await _materialRepository.GetByIdAsync(materialId, cancellationToken);
        if (material == null)
            return false;

        return material.IsStockAvailable(requestedQuantity);
    }

    public async Task ReserveMaterialAsync(
        Material material, 
        MaterialQuantity quantity, 
        Guid visitId, 
        CancellationToken cancellationToken = default)
    {
        if (!material.IsStockAvailable(quantity))
            throw new DomainException($"Insufficient stock for material {material.Name}");

        // In a real implementation, you might have a MaterialReservation entity
        // For now, we just validate availability
    }

    public async Task ConsumeMaterialAsync(
        Material material, 
        MaterialQuantity quantity, 
        Guid visitId, 
        string performedBy, 
        CancellationToken cancellationToken = default)
    {
        if (!material.IsStockAvailable(quantity))
            throw new DomainException($"Insufficient stock for material {material.Name}");

        material.DeductStock(quantity);
    }

    public async Task<List<Material>> GetLowStockMaterialsAsync(
        Guid officeId, 
        CancellationToken cancellationToken = default)
    {
        return (List<Material>)await _materialRepository.GetLowStockItemsAsync(officeId, cancellationToken);
    }
}
