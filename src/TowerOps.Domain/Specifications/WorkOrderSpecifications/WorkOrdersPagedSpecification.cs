namespace TowerOps.Domain.Specifications.WorkOrderSpecifications;

using TowerOps.Domain.Entities.WorkOrders;
using TowerOps.Domain.Specifications;

public sealed class WorkOrdersPagedSpecification : BaseSpecification<WorkOrder>
{
    public WorkOrdersPagedSpecification(int? skip = null, int? take = null)
        : base(wo => !wo.IsDeleted)
    {
        ApplyOrderByDescending(wo => wo.CreatedAt);

        if (skip.HasValue && take.HasValue)
        {
            ApplyPaging(skip.Value, take.Value);
        }
    }
}
