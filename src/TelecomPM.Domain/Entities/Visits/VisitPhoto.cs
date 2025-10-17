using TelecomPM.Domain.Common;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.ValueObjects;

namespace TelecomPM.Domain.Entities.Visits;

// ==================== Visit Photo ====================
public sealed class VisitPhoto : Entity<Guid>
{
    public Guid VisitId { get; private set; }
    public PhotoType Type { get; private set; }
    public PhotoCategory Category { get; private set; }
    public string ItemName { get; private set; } = string.Empty;
    public string FileName { get; private set; } = string.Empty;
    public string FilePath { get; private set; } = string.Empty;
    public string? ThumbnailPath { get; private set; }
    public long FileSizeBytes { get; private set; }
    public int Width { get; private set; }
    public int Height { get; private set; }
    public DateTime CapturedAt { get; private set; }
    public Coordinates? Location { get; private set; }
    public string? Description { get; private set; }
    public bool IsMandatory { get; private set; }

    private VisitPhoto() : base() { }

    private VisitPhoto(
        Guid visitId,
        PhotoType type,
        PhotoCategory category,
        string itemName,
        string fileName,
        string filePath,
        bool isMandatory) : base(Guid.NewGuid())
    {
        VisitId = visitId;
        Type = type;
        Category = category;
        ItemName = itemName;
        FileName = fileName;
        FilePath = filePath;
        IsMandatory = isMandatory;
        CapturedAt = DateTime.UtcNow;
    }

    public static VisitPhoto Create(
        Guid visitId,
        PhotoType type,
        PhotoCategory category,
        string itemName,
        string fileName,
        string filePath,
        bool isMandatory = false)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new DomainException("Photo file name is required");

        if (string.IsNullOrWhiteSpace(filePath))
            throw new DomainException("Photo file path is required");

        return new VisitPhoto(visitId, type, category, itemName, fileName, filePath, isMandatory);
    }

    public void SetMetadata(int width, int height, long fileSizeBytes)
    {
        Width = width;
        Height = height;
        FileSizeBytes = fileSizeBytes;
    }

    public void SetThumbnail(string thumbnailPath)
    {
        ThumbnailPath = thumbnailPath;
    }

    public void SetLocation(Coordinates location)
    {
        Location = location;
    }

    public void SetDescription(string description)
    {
        Description = description;
    }

    public bool MeetsRequirements()
    {
        // Check minimum dimensions (320x238 or 178x238)
        return (Width >= 320 && Height >= 238) || (Width >= 178 && Height >= 238);
    }
}
