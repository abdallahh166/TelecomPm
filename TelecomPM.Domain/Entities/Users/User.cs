using TelecomPM.Domain.Common;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Entities.Users;

// ==================== User (Aggregate Root) ====================
public sealed class User : AggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public Guid OfficeId { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    
    // For PM Engineers
    public int? MaxAssignedSites { get; private set; }
    public List<string> Specializations { get; private set; } = new();
    public decimal? PerformanceRating { get; private set; }
    
    // Assignments
    public List<Guid> AssignedSiteIds { get; private set; } = new();

    private User() : base() { }

    private User(
        string name,
        string email,
        string phoneNumber,
        UserRole role,
        Guid officeId) : base(Guid.NewGuid())
    {
        Name = name;
        Email = email;
        PhoneNumber = phoneNumber;
        Role = role;
        OfficeId = officeId;
        IsActive = true;
    }

    public static User Create(
        string name,
        string email,
        string phoneNumber,
        UserRole role,
        Guid officeId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("User name is required");

        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Email is required");

        if (!IsValidEmail(email))
            throw new DomainException("Invalid email format");

        return new User(name, email, phoneNumber, role, officeId);
    }

    public void UpdateProfile(string name, string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("User name is required");

        Name = name;
        PhoneNumber = phoneNumber;
        MarkAsUpdated(Email);
    }

    public void UpdateRole(UserRole newRole)
    {
        Role = newRole;
        MarkAsUpdated(Email);
    }

    public void AssignToOffice(Guid officeId)
    {
        OfficeId = officeId;
        AssignedSiteIds.Clear(); // Clear site assignments when office changes
        MarkAsUpdated(Email);
    }

    public void SetEngineerCapacity(int maxSites, List<string> specializations)
    {
        if (Role != UserRole.PMEngineer)
            throw new DomainException("Only PM Engineers can have site capacity");

        if (maxSites <= 0)
            throw new DomainException("Max assigned sites must be greater than zero");

        MaxAssignedSites = maxSites;
        Specializations = specializations;
    }

    public void AssignSite(Guid siteId)
    {
        if (Role != UserRole.PMEngineer)
            throw new DomainException("Only PM Engineers can be assigned sites");

        if (MaxAssignedSites.HasValue && AssignedSiteIds.Count >= MaxAssignedSites.Value)
            throw new DomainException($"Engineer has reached maximum capacity of {MaxAssignedSites.Value} sites");

        if (!AssignedSiteIds.Contains(siteId))
        {
            AssignedSiteIds.Add(siteId);
        }
    }

    public void UnassignSite(Guid siteId)
    {
        AssignedSiteIds.Remove(siteId);
    }

    public void UpdatePerformanceRating(decimal rating)
    {
        if (rating < 0 || rating > 5)
            throw new DomainException("Performance rating must be between 0 and 5");

        PerformanceRating = rating;
    }

    public void Activate()
    {
        IsActive = true;
        MarkAsUpdated(Email);
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkAsUpdated(Email);
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public bool CanBeAssignedMoreSites()
    {
        if (Role != UserRole.PMEngineer) return false;
        if (!MaxAssignedSites.HasValue) return true;
        return AssignedSiteIds.Count < MaxAssignedSites.Value;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
