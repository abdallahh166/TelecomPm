namespace TelecomPM.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TelecomPM.Domain.Entities.Materials;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.ToTable("Materials");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(m => m.Code)
            .IsUnique();

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(1000);

        builder.Property(m => m.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(m => m.Supplier)
            .HasMaxLength(200);

        // Owned Type: CurrentStock
        builder.OwnsOne(m => m.CurrentStock, stock =>
        {
            stock.Property(s => s.Value)
                .HasColumnName("CurrentStock")
                .HasPrecision(18, 4);

            stock.Property(s => s.Unit)
                .HasColumnName("Unit")
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        // Owned Type: MinimumStock
        builder.OwnsOne(m => m.MinimumStock, stock =>
        {
            stock.Property(s => s.Value)
                .HasColumnName("MinimumStock")
                .HasPrecision(18, 4);

            stock.Property(s => s.Unit)
                .HasColumnName("MinimumStockUnit")
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        // Owned Type: ReorderQuantity
        builder.OwnsOne(m => m.ReorderQuantity, stock =>
        {
            stock.Property(s => s.Value)
                .HasColumnName("ReorderQuantity")
                .HasPrecision(18, 4);

            stock.Property(s => s.Unit)
                .HasColumnName("ReorderQuantityUnit")
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        // Owned Type: UnitCost
        builder.OwnsOne(m => m.UnitCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("UnitCost")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(10);
        });

        // Indexes
        builder.HasIndex(m => m.OfficeId);
        builder.HasIndex(m => m.Category);
        builder.HasIndex(m => m.IsActive);

        // Ignore domain events
        builder.Ignore(m => m.DomainEvents);
    }
}