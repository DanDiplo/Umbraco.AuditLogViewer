using Asp.Versioning;
using Diplo.AuditLogViewer.Models;
using Diplo.AuditLogViewer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Web.Common.Authorization;

namespace Diplo.AuditLogViewer.Controllers;

/// <summary>
/// Management API for the Audit Log Viewer backoffice extension.
/// </summary>
[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("audit-log-viewer")]
[ApiExplorerSettings(GroupName = "Audit Log Viewer")]
[Authorize(Policy = AuthorizationPolicies.SectionAccessSettings)]
public sealed class AuditLogViewerApiController(
    IContentLogService contentLogService,
    IAuditLogService auditLogService,
    IOptions<AuditLogViewerOptions> options) : ManagementApiControllerBase
{
    [HttpGet("settings")]
    [ProducesResponseType<AuditLogViewerOptions>(StatusCodes.Status200OK)]
    public ActionResult<AuditLogViewerOptions> GetSettings()
        => Ok(options.Value);

    [HttpGet("content-log")]
    [ProducesResponseType<PagedLogEntryResult<LogEntry>>(StatusCodes.Status200OK)]
    public ActionResult<PagedLogEntryResult<LogEntry>> GetContentLog(
        [FromQuery] string? logType = null,
        [FromQuery] string? userName = null,
        [FromQuery] string? entityType = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int? nodeId = null,
        [FromQuery] int itemsPerPage = 50,
        [FromQuery] int pageNumber = 1,
        [FromQuery] string sortColumn = "L.Datestamp",
        [FromQuery] string sortOrder = "asc",
        [FromQuery] string? searchTerm = null)
    {
        var request = new ContentLogSearchRequest
        {
            DateFrom = dateFrom,
            DateTo = dateTo,
            EntityType = entityType,
            ItemsPerPage = itemsPerPage,
            LogType = logType,
            NodeId = nodeId,
            PageNumber = pageNumber,
            SearchTerm = searchTerm,
            SortColumn = sortColumn,
            SortOrder = sortOrder,
            UserName = userName
        };

        try
        {
            return Ok(ToPagedResult<LogEntry>(contentLogService.SearchLog(request)));
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("content-log/types")]
    [ProducesResponseType<IEnumerable<string>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetContentLogTypes()
        => Ok(contentLogService.GetLogTypes());

    [HttpGet("content-log/users")]
    [ProducesResponseType<IEnumerable<string>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetContentLogUsers()
        => Ok(contentLogService.GetAllUsers().Select(x => x.Username));

    [HttpGet("content-log/entity-types")]
    [ProducesResponseType<IEnumerable<string>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetContentLogEntityTypes()
        => Ok(contentLogService.GetEntityTypes());

    [HttpGet("content-log/nodes")]
    [ProducesResponseType<IEnumerable<LoggedNodeSuggestion>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<LoggedNodeSuggestion>> GetContentLogNodes(
        [FromQuery] string? term = null,
        [FromQuery] int take = 10)
        => Ok(contentLogService.SearchLoggedNodes(term, Math.Clamp(take, 1, 25)));

    [HttpGet("audit-trail")]
    [ProducesResponseType<PagedLogEntryResult<AuditEntry>>(StatusCodes.Status200OK)]
    public ActionResult<PagedLogEntryResult<AuditEntry>> GetAuditTrail(
        [FromQuery] string? eventType = null,
        [FromQuery] int? performingUserId = null,
        [FromQuery] int? affectedUserId = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int itemsPerPage = 50,
        [FromQuery] int pageNumber = 1,
        [FromQuery] string sortColumn = "eventDateUtc",
        [FromQuery] string sortOrder = "asc",
        [FromQuery] string? performingIp = null,
        [FromQuery] string? searchTerm = null)
    {
        var request = new AuditLogSearchRequest
        {
            AffectedUserId = affectedUserId,
            DateFrom = dateFrom,
            DateTo = dateTo,
            EventType = eventType,
            ItemsPerPage = itemsPerPage,
            PageNumber = pageNumber,
            PerformingUserId = performingUserId,
            PerformingIp = performingIp,
            SearchTerm = searchTerm,
            SortColumn = sortColumn,
            SortOrder = sortOrder
        };

        try
        {
            return Ok(ToPagedResult<AuditEntry>(auditLogService.SearchLog(request)));
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("audit-trail/event-types")]
    [ProducesResponseType<IEnumerable<string>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<string>> GetAuditTrailEventTypes()
        => Ok(auditLogService.GetEventTypes());

    [HttpGet("audit-trail/users")]
    [ProducesResponseType<IEnumerable<BasicUser>>(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<BasicUser>> GetAuditTrailUsers()
        => Ok(auditLogService.GetAllUsers());

    private static PagedLogEntryResult<T> ToPagedResult<T>(NPoco.Page<T> page)
        => new()
        {
            CurrentPage = page.CurrentPage,
            ItemsPerPage = page.ItemsPerPage,
            LogEntries = page.Items,
            TotalItems = page.TotalItems,
            TotalPages = page.TotalPages
        };
}
