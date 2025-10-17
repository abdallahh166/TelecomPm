using TelecomPM.Domain.Common;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.ValueObjects;
using TelecomPM.Domain.Events.MaterialEvents;

namespace TelecomPM.Domain.Entities.Materials;

// ==================== Material (Aggregate Root) ====================
public sealed class Material : AggregateRoot<Guid>
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public MaterialCategory Category { get; private set; }
    public Guid OfficeId { get; private set; }
    
    // Stock Management
    public MaterialQuantity CurrentStock { get; private set; } = null!;
    public MaterialQuantity MinimumStock { get; private set; } = null!;
    public MaterialQuantity? ReorderQuantity { get; private set; }
    
    // Pricing
    public Money UnitCost { get; private set; } = null!;
    
    // Tracking
    public string? Supplier { get; private set; }
    public DateTime? LastRestockDate { get; private set; }
    public bool IsActive { get; private set; }

    private Material() : base() { }

    private Material(
        string code,
        string name,
        string description,
        MaterialCategory category,
        Guid officeId,
        MaterialQuantity initialStock,
        MaterialQuantity minimumStock,
        Money unitCost) : base(Guid.NewGuid())
    {
        Code = code;
        Name = name;
        Description = description;
        Category = category;
        OfficeId = officeId;
        CurrentStock = initialStock;
        MinimumStock = minimumStock;
        UnitCost = unitCost;
        IsActive = true;
    }

    public static Material Create(
        string code,
        string name,
        string description,
        MaterialCategory category,
        Guid officeId,
        MaterialQuantity initialStock,
        MaterialQuantity minimumStock,
        Money unitCost)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new DomainException("Material code is required");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Material name is required");

        return new Material(
            code.ToUpper(), 
            name, 
            description, 
            category, 
            officeId, 
            initialStock, 
            minimumStock, 
            unitCost);
    }

    public void UpdateInfo(string name, string description, MaterialCategory category)
    {
        Name = name;
        Description = description;
        Category = category;
        MarkAsUpdated("System");
    }

    public void UpdatePricing(Money unitCost)
    {
        UnitCost = unitCost;
        MarkAsUpdated("System");
    }

    public void SetReorderQuantity(MaterialQuantity quantity)
    {
        ReorderQuantity = quantity;
    }

    public void SetSupplier(string supplier)
    {
        Supplier = supplier;
    }

    public void AddStock(MaterialQuantity quantity)
    {
        CurrentStock = CurrentStock.Add(quantity);
        LastRestockDate = DateTime.UtcNow;
        MarkAsUpdated("System");
    }

    public void DeductStock(MaterialQuantity quantity)
    {
        CurrentStock = CurrentStock.Subtract(quantity);
        MarkAsUpdated("System");

        if (IsStockLow())
        {
            AddDomainEvent(new LowStockAlertEvent(
                Id,
                Name,
                OfficeId,
                CurrentStock.Value,
                MinimumStock.Value));
        }
    }

    public void AdjustStock(MaterialQuantity newQuantity, string reason)
    {
        CurrentStock = newQuantity;
        MarkAsUpdated($"Stock adjusted: {reason}");
    }

    public void UpdateMinimumStock(MaterialQuantity newMinimum)
    {
        MinimumStock = newMinimum;
    }

    public bool IsStockLow()
    {
        return CurrentStock.Value <= MinimumStock.Value;
    }

    public bool IsStockAvailable(MaterialQuantity requestedQuantity)
    {
        return CurrentStock.Value >= requestedQuantity.Value && 
               CurrentStock.Unit == requestedQuantity.Unit;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
