using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Interfaces.Repositories;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Services;

public sealed class MaterialStockService : IMaterialStockService
{
    private readonly IMaterialRepository _materialRepository;
    private readonly IUnitOfWork _unitOfWork; //Add IUnitOfWork

    public MaterialStockService(
        IMaterialRepository materialRepository,
        IUnitOfWork unitOfWork) // recive IUnitOfWork in constructor
    {
        _materialRepository = materialRepository;
        _unitOfWork = unitOfWork;
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
        material.ReserveStock(quantity, visitId);

        // Update the entity
        _materialRepository.Update(material);

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ConsumeMaterialAsync(
        Material material,
        MaterialQuantity quantity,
        Guid visitId,
        string performedBy,
        CancellationToken cancellationToken = default)
    {
        // بدل من الخصم المباشر، استخدم الحجز:
        material.ConsumeStock(visitId, performedBy);

        //  حدث الكيان
        _materialRepository.Update(material);

        //  احفظ التغييرات
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<Material>> GetLowStockMaterialsAsync(
        Guid officeId,
        CancellationToken cancellationToken = default)
    {
        return (List<Material>)await _materialRepository.GetLowStockItemsAsync(officeId, cancellationToken);
    }
}
