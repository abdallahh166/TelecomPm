using System.Collections.Generic;
using TelecomPM.Domain.Entities.Sites;

namespace TelecomPM.Domain.Services;

public interface IPhotoChecklistGeneratorService
{
    List<PhotoChecklistItem> GenerateChecklistForSite(Site site);
}
