namespace TelecomPM.Application.Mappings;

using AutoMapper;
using TelecomPM.Application.DTOs.Materials;
using TelecomPM.Application.DTOs.Offices;
using TelecomPM.Application.DTOs.Sites;
using TelecomPM.Application.DTOs.Users;
using TelecomPM.Application.DTOs.Visits;
using TelecomPM.Domain.Entities.Materials;
using TelecomPM.Domain.Entities.Offices;
using TelecomPM.Domain.Entities.Sites;
using TelecomPM.Domain.Entities.Users;
using TelecomPM.Domain.Entities.Visits;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateVisitMappings();
        CreateSiteMappings();
        CreateMaterialMappings();
        CreateUserMappings();
        CreateOfficeMappings();
    }

    private void CreateVisitMappings()
    {
        // Visit -> VisitDto
        CreateMap<Visit, VisitDto>()
            .ForMember(d => d.Duration, opt => opt.MapFrom(s =>
                s.ActualDuration != null ? s.ActualDuration.ToString() : null))
            .ForMember(d => d.CanBeEdited, opt => opt.MapFrom(s => s.CanBeEdited()))
            .ForMember(d => d.CanBeSubmitted, opt => opt.MapFrom(s => s.CanBeSubmitted()));

        // Visit -> VisitDetailDto
        CreateMap<Visit, VisitDetailDto>()
            .IncludeBase<Visit, VisitDto>();

        // VisitPhoto -> VisitPhotoDto
        CreateMap<VisitPhoto, VisitPhotoDto>()
            .ForMember(d => d.FileUrl, opt => opt.MapFrom(s => s.FilePath))
            .ForMember(d => d.ThumbnailUrl, opt => opt.MapFrom(s => s.ThumbnailPath));

        // VisitReading -> VisitReadingDto
        CreateMap<VisitReading, VisitReadingDto>();

        // VisitChecklist -> VisitChecklistDto
        CreateMap<VisitChecklist, VisitChecklistDto>();

        // VisitMaterialUsage -> VisitMaterialUsageDto
        CreateMap<VisitMaterialUsage, VisitMaterialUsageDto>()
            .ForMember(d => d.Quantity, opt => opt.MapFrom(s => s.Quantity.Value))
            .ForMember(d => d.Unit, opt => opt.MapFrom(s => s.Quantity.Unit.ToString()))
            .ForMember(d => d.UnitCost, opt => opt.MapFrom(s => s.UnitCost.Amount))
            .ForMember(d => d.TotalCost, opt => opt.MapFrom(s => s.TotalCost.Amount));

        // VisitIssue -> VisitIssueDto
        CreateMap<VisitIssue, VisitIssueDto>()
            .ForMember(d => d.PhotoUrls, opt => opt.Ignore());

        // VisitApproval -> VisitApprovalDto
        CreateMap<VisitApproval, VisitApprovalDto>();
    }

    private void CreateSiteMappings()
    {
        // Site -> SiteDto
        CreateMap<Site, SiteDto>()
            .ForMember(d => d.SiteCode, opt => opt.MapFrom(s => s.SiteCode.Value));

        // Site -> SiteDetailDto
        CreateMap<Site, SiteDetailDto>()
            .IncludeBase<Site, SiteDto>()
            .ForMember(d => d.Coordinates, opt => opt.MapFrom(s =>
                new CoordinatesDto(s.Coordinates.Latitude, s.Coordinates.Longitude)))
            .ForMember(d => d.Address, opt => opt.MapFrom(s =>
                new AddressDto(s.Address.Street, s.Address.City, s.Address.Region, s.Address.Details)));

        // SiteTowerInfo -> SiteTowerInfoDto
        CreateMap<SiteTowerInfo, SiteTowerInfoDto>();

        // SitePowerSystem -> SitePowerSystemDto
        CreateMap<SitePowerSystem, SitePowerSystemDto>();

        // SiteRadioEquipment -> SiteRadioEquipmentDto
        CreateMap<SiteRadioEquipment, SiteRadioEquipmentDto>();

        // SiteTransmission -> SiteTransmissionDto
        CreateMap<SiteTransmission, SiteTransmissionDto>();

        // SiteCoolingSystem -> SiteCoolingSystemDto
        CreateMap<SiteCoolingSystem, SiteCoolingSystemDto>();

        // SiteFireSafety -> SiteFireSafetyDto
        CreateMap<SiteFireSafety, SiteFireSafetyDto>()
            .ForMember(d => d.ExtinguishersCount, opt => opt.MapFrom(s => s.Extinguishers.Count));

        // SiteSharing -> SiteSharingDto
        CreateMap<SiteSharing, SiteSharingDto>();
    }

    private void CreateMaterialMappings()
    {
        // Material -> MaterialDto
        CreateMap<Material, MaterialDto>()
            .ForMember(d => d.CurrentStock, opt => opt.MapFrom(s => s.CurrentStock.Value))
            .ForMember(d => d.Unit, opt => opt.MapFrom(s => s.CurrentStock.Unit.ToString()))
            .ForMember(d => d.MinimumStock, opt => opt.MapFrom(s => s.MinimumStock.Value))
            .ForMember(d => d.UnitCost, opt => opt.MapFrom(s => s.UnitCost.Amount))
            .ForMember(d => d.Currency, opt => opt.MapFrom(s => s.UnitCost.Currency))
            .ForMember(d => d.IsLowStock, opt => opt.MapFrom(s => s.IsStockLow()));
    }

    private void CreateUserMappings()
    {
        // User -> UserDto
        CreateMap<User, UserDto>()
            .ForMember(d => d.OfficeName, opt => opt.Ignore())
            .ForMember(d => d.AssignedSitesCount, opt => opt.MapFrom(s => s.AssignedSiteIds.Count));
    }

    private void CreateOfficeMappings()
    {
        // Office -> OfficeDto
        CreateMap<Office, OfficeDto>()
            .ForMember(d => d.City, opt => opt.MapFrom(s => s.Address.City));
    }
}