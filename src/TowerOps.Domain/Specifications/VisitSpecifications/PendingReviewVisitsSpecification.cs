using TowerOps.Domain.Entities.Visits;
using TowerOps.Domain.Enums;
using TowerOps.Domain.Specifications;

namespace TowerOps.Domain.Specifications.VisitSpecifications;

public sealed class PendingReviewVisitsSpecification : BaseSpecification<Visit>
{
    public PendingReviewVisitsSpecification(int? skip = null, int? take = null)
        : base(v => v.Status == VisitStatus.Submitted && !v.IsDeleted)
    {
        ApplyOrderBy(v => v.CreatedAt);

        if (skip.HasValue && take.HasValue)
        {
            ApplyPaging(skip.Value, take.Value);
        }
    }
}
