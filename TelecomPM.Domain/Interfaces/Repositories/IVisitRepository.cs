using TelecomPM.Domain.Entities.Visits;
using TelecomPM.Domain.Enums;

namespace TelecomPM.Domain.Interfaces.Repositories;

// Visit Repository
public interface IVisitRepository : IRepository<Visit, Guid>
{
    Task<Visit?> GetByVisitNumberAsync(string visitNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Visit>> GetBySiteIdAsync(Guid siteId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Visit>> GetByEngineerIdAsync(Guid engineerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Visit>> GetByStatusAsync(VisitStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Visit>> GetPendingReviewAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Visit>> GetScheduledVisitsAsync(DateTime date, CancellationToken cancellationToken = default);
    Task<Visit?> GetActiveVisitForEngineerAsync(Guid engineerId, CancellationToken cancellationToken = default);
    Task<string> GenerateVisitNumberAsync(CancellationToken cancellationToken = default);
}