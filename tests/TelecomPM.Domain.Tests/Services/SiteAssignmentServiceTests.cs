using FluentAssertions;
using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Entities.Users;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Interfaces.Repositories;
using TelecomPM.Domain.Services;

namespace TelecomPM.Domain.Tests.Services;

public class SiteAssignmentServiceTests
{
    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly List<User> _users;
        public FakeUserRepository(List<User> users) { _users = users; }
        public Task AddAsync(User entity, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task AddRangeAsync(IEnumerable<User> entities, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<int> CountAsync(TelecomPM.Domain.Specifications.ISpecification<User> specification, CancellationToken cancellationToken = default) => Task.FromResult(0);
        public Task<bool> ExistsAsync(TelecomPM.Domain.Specifications.ISpecification<User> specification, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task<IReadOnlyList<User>> FindAsync(TelecomPM.Domain.Specifications.ISpecification<User> specification, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<User>>(_users);
        public Task<User?> FindOneAsync(TelecomPM.Domain.Specifications.ISpecification<User> specification, CancellationToken cancellationToken = default) => Task.FromResult<User?>(null);
        public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<User>>(_users);
        public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult(_users.SingleOrDefault(u => u.Id == id));
        public Task<IReadOnlyList<User>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<User>>(_users.Where(u => u.OfficeId == officeId).ToList());
        public Task<IReadOnlyList<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<User>>(_users.Where(u => u.Role == role).ToList());
        public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) => Task.FromResult(_users.SingleOrDefault(u => u.Email == email));
        public Task<bool> IsEmailUniqueAsync(string email, Guid? excludeUserId = null, CancellationToken cancellationToken = default) => Task.FromResult(!_users.Any(u => u.Email == email && (!excludeUserId.HasValue || u.Id != excludeUserId)));
        public void Remove(User entity) { }
        public void RemoveRange(IEnumerable<User> entities) { }
        public void Update(User entity) { }
    }

    private sealed class FakeSiteRepository : ISiteRepository
    {
        public Task AddAsync(Site entity, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task AddRangeAsync(IEnumerable<Site> entities, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<int> CountAsync(TelecomPM.Domain.Specifications.ISpecification<Site> specification, CancellationToken cancellationToken = default) => Task.FromResult(0);
        public Task<bool> ExistsAsync(TelecomPM.Domain.Specifications.ISpecification<Site> specification, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task<IReadOnlyList<Site>> FindAsync(TelecomPM.Domain.Specifications.ISpecification<Site> specification, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<Site?> FindOneAsync(TelecomPM.Domain.Specifications.ISpecification<Site> specification, CancellationToken cancellationToken = default) => Task.FromResult<Site?>(null);
        public Task<IReadOnlyList<Site>> GetAllAsync(CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<Site?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult<Site?>(null);
        public Task<Site?> GetBySiteCodeAsync(string siteCode, CancellationToken cancellationToken = default) => Task.FromResult<Site?>(null);
        public Task<IReadOnlyList<Site>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<IReadOnlyList<Site>> GetByEngineerIdAsync(Guid engineerId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<IReadOnlyList<Site>> GetByComplexityAsync(SiteComplexity complexity, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<IReadOnlyList<Site>> GetSitesNeedingMaintenanceAsync(int daysThreshold, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyList<Site>>(new List<Site>());
        public Task<bool> IsSiteCodeUniqueAsync(string siteCode, CancellationToken cancellationToken = default) => Task.FromResult(true);
        public void Remove(Site entity) { }
        public void RemoveRange(IEnumerable<Site> entities) { }
        public void Update(Site entity) { }
    }

    [Fact]
    public async Task GetBestEngineersForSiteAsync_ShouldRankByCapacityAndSpecialization()
    {
        var officeId = Guid.NewGuid();
        var e1 = User.Create("E1", "e1@t.com", "010", UserRole.PMEngineer, officeId);
        var e2 = User.Create("E2", "e2@t.com", "010", UserRole.PMEngineer, officeId);
        var e3 = User.Create("E3", "e3@t.com", "010", UserRole.PMEngineer, officeId);

        e1.SetEngineerCapacity(1, new List<string> { "Generator Sites" });
        e1.AssignSite(Guid.NewGuid()); // full capacity
        e1.UpdatePerformanceRating(5);

        e2.SetEngineerCapacity(5, new List<string> { "Solar Sites", "Sharing Sites" });
        e2.UpdatePerformanceRating(3);

        e3.SetEngineerCapacity(5, new List<string> { "Complex Sites" });
        e3.UpdatePerformanceRating(4);

        var users = new List<User> { e1, e2, e3 };
        var userRepo = new FakeUserRepository(users);
        var siteRepo = new FakeSiteRepository();
        var service = new SiteAssignmentService(userRepo, siteRepo);

        var site = (Site)System.Runtime.Serialization.FormatterServices.GetUninitializedObject(typeof(Site));
        typeof(Site).GetProperty("OfficeId")!.SetValue(site, officeId);
        var sharing = SiteSharing.Create(Guid.Empty);
        sharing.EnableSharing(string.Empty, new List<string>());
        typeof(Site).GetProperty("SharingInfo")!.SetValue(site, sharing);
        var ps = SitePowerSystem.Create(Guid.Empty, PowerConfiguration.ACOnly, RectifierBrand.Delta, BatteryType.VRLA);
        typeof(Site).GetProperty("PowerSystem")!.SetValue(site, ps);
        typeof(Site).GetProperty("Complexity")!.SetValue(site, SiteComplexity.High);
        typeof(SitePowerSystem).GetMethod("SetSolarPanel")!.Invoke(ps, new object[] { 3000, 10 });

        var best = await service.GetBestEngineersForSiteAsync(site);

        best.Should().NotBeEmpty();
        best.First().Id.Should().Be(e2.Id, "solar specialization and capacity should rank high");
    }
}


