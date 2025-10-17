using TelecomPM.Domain.Common;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Entities.Offices;

// ==================== Office (Aggregate Root) ====================
public sealed class Office : AggregateRoot<Guid>
{
    public string Code { get; private set; } = string.Empty; // TNT, ALX, CAI
    public string Name { get; private set; } = string.Empty;
    public string Region { get; private set; } = string.Empty;
    public Address Address { get; private set; } = null!;
    public Coordinates? Coordinates { get; private set; }
    public string ContactPerson { get; private set; } = string.Empty;
    public string ContactPhone { get; private set; } = string.Empty;
    public string ContactEmail { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    
    // Statistics
    public int TotalSites { get; private set; }
    public int ActiveEngineers { get; private set; }
    public int ActiveTechnicians { get; private set; }

    private Office() : base() { }

    private Office(
        string code,
        string name,
        string region,
        Address address) : base(Guid.NewGuid())
    {
        Code = code;
        Name = name;
        Region = region;
        Address = address;
        IsActive = true;
    }

    public static Office Create(
        string code,
        string name,
        string region,
        Address address)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new DomainException("Office code is required");

        if (code.Length != 3)
            throw new DomainException("Office code must be exactly 3 characters");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Office name is required");

        return new Office(code.ToUpper(), name, region, address);
    }

    public void UpdateInfo(string name, string region, Address address)
    {
        Name = name;
        Region = region;
        Address = address;
        MarkAsUpdated("System");
    }

    public void SetCoordinates(Coordinates coordinates)
    {
        Coordinates = coordinates;
    }

    public void SetContactInfo(string person, string phone, string email)
    {
        ContactPerson = person;
        ContactPhone = phone;
        ContactEmail = email;
    }

    public void UpdateStatistics(int totalSites, int activeEngineers, int activeTechnicians)
    {
        TotalSites = totalSites;
        ActiveEngineers = activeEngineers;
        ActiveTechnicians = activeTechnicians;
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
