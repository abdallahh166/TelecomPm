namespace TelecomPM.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TelecomPM.Domain.Entities.Visits;

public class VisitChecklistConfiguration : IEntityTypeConfiguration<VisitChecklist>
{
    public void Configure(EntityTypeBuilder<VisitChecklist> builder)
    {
        builder.ToTable("VisitChecklists");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.ItemName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Notes)
            .HasMaxLength(500);

        builder.Property(c => c.RelatedPhotoIds)
            .HasConversion(
                v => string.Join(',', v.Select(id => id.ToString())),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                      .Select(Guid.Parse).ToList())
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(c => c.VisitId);
        builder.HasIndex(c => c.Category);
        builder.HasIndex(c => c.Status);
    }
}