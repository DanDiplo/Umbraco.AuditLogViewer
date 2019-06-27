using System;
using System.Collections.Generic;
using System.Linq;
using Diplo.AuditLogViewer.Models;
using NPoco;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Models;
using Umbraco.Core.Persistence;
using Umbraco.Core.Scoping;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Service for querying the umbraco content audit log
    /// </summary>
    public class ContentLogService : LogServiceBase, IContentLogService
    {
        /// <summary>
        /// Instantiates the log service with access to database and caches
        /// </summary>
        /// <param name="scope">The Umbraco scope provider</param>
        /// <param name="caches">The Umbraco caches</param>
        public ContentLogService(IScopeProvider scopeProvider, AppCaches caches) : base(scopeProvider, caches)
        {
        }

        /// <summary>
        /// Searches the Umbraco Log table
        /// </summary>
        /// <param name="request">The search request criteria</param>
        /// <returns>A page of log results</returns>
        public Page<LogEntry> SearchLog(ContentLogSearchRequest request)
        {
            using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
            {
                if (!IsValidOrderByParameter(request.SortColumn))
                {
                    throw new ArgumentOutOfRangeException("The order by value '" + request.SortColumn + "' is not a valid sort parameter.");
                }

                if (!IsValidOrderByDirectionParameter(request.SortOrder))
                {
                    throw new ArgumentOutOfRangeException("The order by value '" + request.SortOrder + "' is not a valid sort order.");
                }

                const string sql = @"SELECT L.Id, N.[text] as Text, CASE WHEN U.userName IS NULL THEN 'SYSTEM' ELSE U.userName END as Username,
                L.Datestamp as DateStamp, L.logHeader, L.logComment, L.nodeId,
                CT.Alias as Alias, N.nodeObjectType, CT.icon as Icon
			    FROM umbracoLog L
			    LEFT JOIN umbracoUser U ON L.userId = U.id
			    LEFT JOIN umbracoNode N ON N.id = L.nodeId
				LEFT JOIN umbracoContent C ON C.nodeId = N.id
			    LEFT JOIN cmsContentType CT ON C.contentTypeId = CT.nodeId
                WHERE 1 = 1";

                var query = scope.SqlContext.Sql(sql);

                if (!string.IsNullOrEmpty(request.LogType))
                {
                    query = query.Append(" AND L.LogHeader = @0", request.LogType);
                }

                if (!string.IsNullOrEmpty(request.UserName))
                {
                    query = query.Append(" AND (CASE When U.userName IS NULL Then 'SYSTEM' ELSE U.userName END) = @0", request.UserName);
                }

                if (request.DateFrom.HasValue)
                {
                    query = query.Append(" AND L.Datestamp >= @0", request.DateFrom.Value);
                }

                if (request.DateTo.HasValue)
                {
                    query = query.Append(" AND L.Datestamp <= @0", request.DateTo.Value.AddDays(1));
                }

                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Append(" AND (L.logComment LIKE @0 OR N.[text] LIKE @0)", "%" + request.SearchTerm + "%");
                }

                if (request.NodeId.HasValue)
                {
                    query = query.Append(" AND L.NodeId = @0", request.NodeId.Value);
                }

                if (request.SortColumn.InvariantEquals("id"))
                {
                    request.SortColumn = "L.id";
                }

                if (request.SortOrder == "desc")
                {
                    query.OrderByDescending(request.SortColumn);
                }
                else
                {
                    query.OrderBy(request.SortColumn);
                }

                var page = scope.Database.Page<LogEntry>(request.PageNumber, request.ItemsPerPage, query);

                foreach (var node in page.Items.Where(n => n.TypeId.HasValue))
                {
                    node.TypeDesc = GetNodeObjectTypeName(node.TypeId.Value.ToString().ToUpper());
                }

                return page;
            }
        }

        private static string GetNodeObjectTypeName(string id)
        {
            switch (id)
            {
                case Constants.ObjectTypes.Strings.ContentItem:
                    return "Content Item";

                case Constants.ObjectTypes.Strings.ContentItemType:
                    return "Content Item Type";

                case Constants.ObjectTypes.Strings.ContentRecycleBin:
                    return "Recylce Bin";

                case Constants.ObjectTypes.Strings.DataType:
                    return "Data Type";

                case Constants.ObjectTypes.Strings.DataTypeContainer:
                    return "Data Type Container";

                case Constants.ObjectTypes.Strings.Document:
                    return "Document";

                case Constants.ObjectTypes.Strings.DocumentBlueprint:
                    return "Document Blueprint";

                case Constants.ObjectTypes.Strings.DocumentType:
                    return "Document Type";

                case Constants.ObjectTypes.Strings.DocumentTypeContainer:
                    return "Document Type Container";

                case Constants.ObjectTypes.Strings.FormsDataSource:
                    return "Forms Data Source";

                case Constants.ObjectTypes.Strings.FormsForm:
                    return "Forms Form";

                case Constants.ObjectTypes.Strings.FormsPreValue:
                    return "Forms PreValue";

                case Constants.ObjectTypes.Strings.Language:
                    return "Language";

                case Constants.ObjectTypes.Strings.Media:
                    return "Media";

                case Constants.ObjectTypes.Strings.MediaType:
                    return "Media Type";

                case Constants.ObjectTypes.Strings.MediaTypeContainer:
                    return "Media Type Container";

                case Constants.ObjectTypes.Strings.MediaRecycleBin:
                    return "Media Recycle Bin";

                case Constants.ObjectTypes.Strings.Member:
                    return "Member";

                case Constants.ObjectTypes.Strings.MemberGroup:
                    return "Member Group";

                case Constants.ObjectTypes.Strings.MemberType:
                    return "Member Type";

                case Constants.ObjectTypes.Strings.RelationType:
                    return "Relation Type";

                case Constants.ObjectTypes.Strings.SystemRoot:
                    return "System Root";

                case Constants.ObjectTypes.Strings.Template:
                    return "Template";

                default:
                    return string.Empty;
            }
        }

        /// <summary>
        /// Gets the log aliases [not used]
        /// </summary>
        /// <returns>A list of aliases</returns>
        public IEnumerable<string> GetLogAliases()
        {
            using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
            {
                const string sql = @"SELECT DISTINCT(CT.alias)
			    FROM umbracoLog L
			    LEFT JOIN umbracoUser U ON L.userId = U.id
			    LEFT JOIN umbracoNode N ON N.id = L.NodeId
			    LEFT JOIN cmsContentType CT ON L.NodeId = CT.nodeId
			    WHERE CT.alias IS NOT NULL
			    ORDER BY CT.alias";

                return scope.Database.Fetch<string>(sql);
            }
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc)
        /// </summary>
        /// <returns>A list of header types</returns>
        public IEnumerable<string> GetLogTypes()
        {
            return Enum.GetNames(typeof(AuditType)).OrderBy(x => x);
        }

        /// <summary>
        /// Gets the top pages that were last updated that are in the audit log
        /// </summary>
        /// <param name="amount">The maximum number of pages to retrieve</param>
        /// <returns>A page of Umbraco pages</returns>
        public IEnumerable<BasicPage> GetLastUpdatedPages(int amount = 10)
        {
            using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
            {
                const string sql = @"SELECT TOP 10 CV.nodeId, CV.[text] as Title, CV.versionDate as UpdateDate, CT.icon
                FROM umbracoContentVersion CV
                INNER JOIN umbracoContent C on CV.nodeId = C.nodeId
                INNER JOIN cmsContentType CT on C.contentTypeId = CT.nodeId
                WHERE CV.[current] = 1
                ORDER BY versionDate DESC";

                return scope.Database.Fetch<BasicPage>(new Sql(string.Format(sql, amount)));
            }
        }

        protected override string[] ValidOrderByParamaters => new string[]
        {
            "L.Id",
            "L.NodeId",
            "N.Text",
            "U.id",
            "U.userName",
            "U.userEmail",
            "L.Datestamp",
            "L.LogHeader",
            "L.logComment",
            "N.nodeObjectType",
            "CT.Icon"
        };
    }
}