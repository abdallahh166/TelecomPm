﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TelecomPM.Domain.Entities.Sites;

namespace TelecomPm.Infrastructure.Persistence.Configurations
{
    public class SiteRadioEquipmentConfiguration : IEntityTypeConfiguration<SiteRadioEquipment>
    {
        public void Configure(EntityTypeBuilder<SiteRadioEquipment> builder)
        {
            builder.ToTable("SiteRadioEquipments");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.BTSType)
                .HasMaxLength(100);

            builder.Property(r => r.NodeBType)
                .HasMaxLength(100);

            // Sectors as JSON
            builder.OwnsMany(r => r.Sectors, sector =>
            {
                sector.ToJson();
                sector.Property(s => s.AntennaType)
                    .HasMaxLength(100);
            });

            builder.HasIndex(r => r.SiteId);
        }
    }
}
