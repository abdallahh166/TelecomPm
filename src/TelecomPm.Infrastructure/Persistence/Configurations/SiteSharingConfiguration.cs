using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TelecomPM.Domain.Entities.Sites;

namespace TelecomPm.Infrastructure.Persistence.Configurations
{
    public class SiteSharingConfiguration : IEntityTypeConfiguration<SiteSharing>
    {
        public void Configure(EntityTypeBuilder<SiteSharing> builder)
        {
            builder.ToTable("SiteSharings");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.HostOperator)
                .HasMaxLength(100);

            // GuestOperators as JSON
            builder.Property(s => s.GuestOperators)
                .HasColumnType("nvarchar(max)")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions)null) ?? new List<string>()
                );

            builder.HasIndex(s => s.SiteId);
        }
    }
}
