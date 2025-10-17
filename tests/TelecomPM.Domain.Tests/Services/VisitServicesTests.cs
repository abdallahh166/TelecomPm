using FluentAssertions;
using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Entities.Visits;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Services;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Tests.Services;

public class VisitServicesTests
{
    [Fact]
    public void VisitDurationCalculator_ShouldRespectSiteMinutes()
    {
        var site = (Site)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Site));
        typeof(Site).GetProperty("EstimatedVisitDurationMinutes")!.SetValue(site, 125);

        var svc = new VisitDurationCalculatorService();
        svc.CalculateEstimatedDuration(site).Should().Be(TimeSpan.FromMinutes(125));
    }

    [Fact]
    public void VisitValidationService_ShouldReportMissingPhotosAndReadings()
    {
        var visit = Visit.Create("V1", Guid.NewGuid(), "TNT001", "Site1", Guid.NewGuid(), "Eng", DateTime.Today, VisitType.PreventiveMaintenance);
        var site = (Site)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Site));

        var validation = new VisitValidationService().ValidateVisitCompletion(visit, site);
        validation.Errors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task VisitNumberGeneratorService_ShouldFormatNumber()
    {
        var fakeRepo = new FakeVisitRepository(last: $"V{DateTime.UtcNow.Year}000123");
        var svc = new VisitNumberGeneratorService(fakeRepo);
        var next = await svc.GenerateNextVisitNumberAsync();
        next.Should().MatchRegex($"^V{DateTime.UtcNow.Year}\\d{{6}}$");
    }

    private sealed class FakeVisitRepository : TelecomPM.Domain.Interfaces.Repositories.IVisitRepository
    {
        private readonly string _last;
        public FakeVisitRepository(string last) { _last = last; }
        public Task AddAsync(Visit entity, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task AddRangeAsync(IEnumerable<Visit> entities, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<int> CountAsync(TelecomPM.Domain.Specifications.ISpecification<Visit> specification, CancellationToken cancellationToken = default) => Task.FromResult(0);
        public Task<bool> ExistsAsync(TelecomPM.Domain.Specifications.ISpecification<Visit> specification, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task<IReadOnlyList<Visit>> FindAsync(TelecomPM.Domain.Specifications.ISpecification<Visit> specification, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<Visit?> FindOneAsync(TelecomPM.Domain.Specifications.ISpecification<Visit> specification, CancellationToken cancellationToken = default) => Task.FromResult<Visit?>(null);
        public Task<IReadOnlyList<Visit>> GetAllAsync(CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<Visit?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult<Visit?>(null);
        public Task<IReadOnlyList<Visit>> GetByEngineerIdAsync(Guid engineerId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<IReadOnlyList<Visit>> GetBySiteIdAsync(Guid siteId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<IReadOnlyList<Visit>> GetByStatusAsync(VisitStatus status, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<IReadOnlyList<Visit>> GetPendingReviewAsync(CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<IReadOnlyList<Visit>> GetScheduledVisitsAsync(DateTime date, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Visit>>(new List<Visit>());
        public Task<Visit?> GetActiveVisitForEngineerAsync(Guid engineerId, CancellationToken cancellationToken = default) => Task.FromResult<Visit?>(null);
        public Task<Visit?> GetByVisitNumberAsync(string visitNumber, CancellationToken cancellationToken = default) => Task.FromResult<Visit?>(null);
        public Task<string> GenerateVisitNumberAsync(CancellationToken cancellationToken = default) => Task.FromResult(_last);
        public void Remove(Visit entity) { }
        public void RemoveRange(IEnumerable<Visit> entities) { }
        public void Update(Visit entity) { }
    }
}


