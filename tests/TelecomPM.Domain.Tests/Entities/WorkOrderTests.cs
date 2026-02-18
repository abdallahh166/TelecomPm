using FluentAssertions;
using TelecomPM.Domain.Entities.WorkOrders;
using TelecomPM.Domain.Enums;
using TelecomPM.Domain.Exceptions;
using TelecomPM.Domain.Events.WorkOrderEvents;

namespace TelecomPM.Domain.Tests.Entities;

public class WorkOrderTests
{
    [Fact]
    public void Create_WithValidData_ShouldInitializeCreatedStatusAndDeadlines()
    {
        var workOrder = WorkOrder.Create(
            woNumber: "WO-1001",
            siteCode: "S-TNT-001",
            officeCode: "TNT",
            slaClass: SlaClass.P2,
            issueDescription: "Power alarm and partial degradation");

        workOrder.Status.Should().Be(WorkOrderStatus.Created);
        workOrder.SiteCode.Should().Be("S-TNT-001");
        workOrder.OfficeCode.Should().Be("TNT");
        workOrder.ResponseDeadlineUtc.Should().BeAfter(workOrder.CreatedAt);
        workOrder.ResolutionDeadlineUtc.Should().BeAfter(workOrder.ResponseDeadlineUtc);
    }

    [Fact]
    public void Create_ShouldNormalizeCodesAndDescription()
    {
        var workOrder = WorkOrder.Create(
            woNumber: "  WO-1008  ",
            siteCode: " s-tnt-008 ",
            officeCode: " tnt ",
            slaClass: SlaClass.P4,
            issueDescription: "  Low priority issue  ");

        workOrder.WoNumber.Should().Be("WO-1008");
        workOrder.SiteCode.Should().Be("S-TNT-008");
        workOrder.OfficeCode.Should().Be("TNT");
        workOrder.IssueDescription.Should().Be("Low priority issue");
    }

    [Fact]
    public void Assign_FromCreated_ShouldMoveToAssigned()
    {
        var workOrder = WorkOrder.Create("WO-1002", "S-TNT-002", "TNT", SlaClass.P3, "Checklist mismatch");

        workOrder.Assign(Guid.NewGuid(), "Engineer A", "Dispatcher");

        workOrder.Status.Should().Be(WorkOrderStatus.Assigned);
        workOrder.AssignedAtUtc.Should().NotBeNull();
        workOrder.AssignedEngineerName.Should().Be("Engineer A");
        workOrder.AssignedBy.Should().Be("Dispatcher");
    }

    [Fact]
    public void Assign_WhenNotCreatedOrRework_ShouldThrowDomainException()
    {
        var workOrder = WorkOrder.Create("WO-1003", "S-TNT-003", "TNT", SlaClass.P1, "Critical outage");
        workOrder.Assign(Guid.NewGuid(), "Engineer A", "Dispatcher");

        Action reassign = () => workOrder.Assign(Guid.NewGuid(), "Engineer B", "Dispatcher");

        reassign.Should().Throw<DomainException>()
            .WithMessage("*assigned from Created or Rework state*");
    }

    [Fact]
    public void Create_WithoutIssueDescription_ShouldThrowDomainException()
    {
        Action act = () => WorkOrder.Create("WO-1004", "S-TNT-004", "TNT", SlaClass.P4, string.Empty);

        act.Should().Throw<DomainException>()
            .WithMessage("*Issue description is required*");
    }

    [Fact]
    public void Assign_WithEmptyEngineerId_ShouldThrowDomainException()
    {
        var workOrder = WorkOrder.Create("WO-1005", "S-TNT-005", "TNT", SlaClass.P3, "Door alarm");

        Action act = () => workOrder.Assign(Guid.Empty, "Engineer A", "Dispatcher");

        act.Should().Throw<DomainException>()
            .WithMessage("*Engineer ID is required*");
    }

    [Fact]
    public void Create_ShouldRaiseWorkOrderCreatedEvent()
    {
        var workOrder = WorkOrder.Create("WO-1006", "S-TNT-006", "TNT", SlaClass.P2, "Rectifier alarm");

        workOrder.DomainEvents.Should().ContainSingle(e => e.GetType() == typeof(WorkOrderCreatedEvent));
    }

    [Fact]
    public void Assign_ShouldRaiseWorkOrderAssignedEvent()
    {
        var workOrder = WorkOrder.Create("WO-1007", "S-TNT-007", "TNT", SlaClass.P3, "Battery mismatch");
        workOrder.ClearDomainEvents();

        workOrder.Assign(Guid.NewGuid(), "Engineer C", "Dispatcher");

        workOrder.DomainEvents.Should().ContainSingle(e => e.GetType() == typeof(WorkOrderAssignedEvent));
    }

}
