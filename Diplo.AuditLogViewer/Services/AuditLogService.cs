using Diplo.AuditLogViewer.Models;
using NPoco;
using System.Collections.Generic;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Extensions;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Service for querying the Umbraco auditing log entries
    /// </summary>
    public class AuditLogService : LogServiceBase, IAuditLogService
    {
        public AuditLogService(IScopeProvider scopeProvider, AppCaches caches) : base(scopeProvider, caches)
        {
        }

        public Page<AuditEntry> SearchLog(AuditLogSearchRequest request)
        {
            const string sqlBase = @"SELECT id, performingUserId, performingDetails, performingIp, eventDateUtc, affectedUserId, affectedDetails, eventType, eventDetails
                                    FROM umbracoAudit WHERE 1 = 1 ";

            using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
            {
                var query = scope.SqlContext.Sql(sqlBase);

                if (request.AffectedUserId.HasValue)
                {
                    query = query.Append(" AND affectedUserId = @0", request.AffectedUserId.Value);
                }

                if (request.PerformingUserId.HasValue)
                {
                    query = query.Append(" AND performingUserId = @0", request.PerformingUserId.Value);
                }

                if (!string.IsNullOrEmpty(request.EventType))
                {
                    query = query.Append(" AND eventType = @0", request.EventType);
                }

                if (request.DateFrom.HasValue)
                {
                    query = query.Append(" AND eventDateUtc >= @0", request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    query = query.Append(" AND eventDateUtc <= @0", request.DateTo.Value.AddDays(1));
                }

                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Append(" AND (performingDetails LIKE @0 OR affectedDetails LIKE @0 OR eventDetails LIKE @0 OR performingIp LIKE @0)", "%" + request.SearchTerm + "%");
                }

                if (request.SortOrder == "desc")
                {
                    query.OrderByDescending(request.SortColumn);
                }
                else
                {
                    query.OrderBy(request.SortColumn);
                }

                return scope.Database.Page<AuditEntry>(request.PageNumber, request.ItemsPerPage, query);
            }
        }

        public IEnumerable<string> GetEventTypes()
        {
            const string query = "SELECT DISTINCT eventType FROM umbracoAudit ORDER BY eventType";

            using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
            {
                return scope.Database.Fetch<string>(query);
            }
        }

        protected override string[] ValidOrderByParamaters => new string[]
        {
            "id",
            "performingUserId",
            "performingDetails",
            "performingIp",
            "eventDateUtc",
            "affectedUserId",
            "affectedDetails",
            "eventType",
            "eventDetails"
        };
    }
}