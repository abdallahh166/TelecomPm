using TowerOps.Domain.Entities.Materials;

namespace TowerOps.Domain.Specifications.MaterialSpecifications;

public class MaterialsByOfficeSpecification : BaseSpecification<Material>
{
    public MaterialsByOfficeSpecification(Guid officeId, int? skip = null, int? take = null)
        : base(m => m.OfficeId == officeId)
    {
        AddInclude(m => m.Transactions);
        AddOrderBy(m => m.Category);
        AddOrderBy(m => m.Name);

        if (skip.HasValue && take.HasValue)
        {
            ApplyPaging(skip.Value, take.Value);
        }
    }

    public MaterialsByOfficeSpecification(Guid officeId, bool onlyInStock, int? skip = null, int? take = null)
        : base(m => m.OfficeId == officeId &&
                   (!onlyInStock || m.CurrentStock.HasStock))
    {
        AddInclude(m => m.Transactions);
        AddOrderBy(m => m.Name);

        if (skip.HasValue && take.HasValue)
        {
            ApplyPaging(skip.Value, take.Value);
        }
    }
}
