using TelecomPM.Domain.Common;
using TelecomPM.Domain.Enums;

namespace TelecomPM.Domain.Entities.Visits;

// ==================== Visit Approval ====================
public sealed class VisitApproval : Entity<Guid>
{
    public Guid VisitId { get; private set; }
    public Guid ReviewerId { get; private set; }
    public string ReviewerName { get; private set; } = string.Empty;
    public ApprovalAction Action { get; private set; }
    public string? Comments { get; private set; }
    public DateTime ReviewedAt { get; private set; }

    private VisitApproval() : base() { }

    private VisitApproval(
        Guid visitId,
        Guid reviewerId,
        string reviewerName,
        ApprovalAction action,
        string? comments) : base(Guid.NewGuid())
    {
        VisitId = visitId;
        ReviewerId = reviewerId;
        ReviewerName = reviewerName;
        Action = action;
        Comments = comments;
        ReviewedAt = DateTime.UtcNow;
    }

    public static VisitApproval Create(
        Guid visitId,
        Guid reviewerId,
        string reviewerName,
        ApprovalAction action,
        string? comments = null)
    {
        return new VisitApproval(visitId, reviewerId, reviewerName, action, comments);
    }
}
