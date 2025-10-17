using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Specifications;

namespace TelecomPM.Domain.Specifications.SiteSpecifications;

public sealed class SitesByRegionSpecification : BaseSpecification<Site>
{
    public SitesByRegionSpecification(string region)
        : base(s => s.Region == region && !s.IsDeleted)
    {
        ApplyOrderBy(s => s.SubRegion);
    }
}
