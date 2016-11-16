using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Diplo.AuditLogViewer.Models;
using Umbraco.Core.Cache;
using Umbraco.Core.Persistence;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Service for querying log and related data
    /// </summary>
    public class LogService
    {
        private readonly UmbracoDatabase db;
        private readonly IRuntimeCacheProvider cache;

        /// <summary>
        /// Instantiates the log service with the Umbraco database and a caching provider
        /// </summary>
        /// <param name="db">The Umbraco database</param>
        /// <param name="cache">A caching provider</param>
        public LogService(UmbracoDatabase db, IRuntimeCacheProvider cache)
        {
            if (db == null)
                throw new ArgumentNullException(nameof(db));

            this.db = db;
            this.cache = cache;
        }

        /// <summary>
        /// Searches the Audit Log table
        /// </summary>
        /// <param name="request">The search request criteria</param>
        /// <returns>A page of log results</returns>
        public Page<LogEntry> SearchAuditLog(LogSearchRequest request)
        {
            string sql = @"SELECT L.Id, N.[text] as Name, U.userName as UserName, L.Datestamp as DateStamp, L.logHeader as LogType, L.logComment as Comment, L.nodeId 
			FROM umbracoLog L 
			LEFT JOIN umbracoUser U ON L.userId = U.id
			LEFT JOIN umbracoNode N ON N.id = L.NodeId
            WHERE 1 = 1";

            Sql query = new Sql(sql);

            if (!String.IsNullOrEmpty(request.LogType))
            {
                query = query.Append(" AND L.LogHeader = @0", request.LogType);
            }

            if (!String.IsNullOrEmpty(request.UserName))
            {
                query = query.Append(" AND U.userName = @0", request.UserName);
            }

            if (request.DateFrom.HasValue)
            {
                query = query.Append(" AND L.Datestamp >= @0", request.DateFrom.Value);
            }

            if (request.DateTo.HasValue)
            {
                query = query.Append(" AND L.Datestamp <= @0", request.DateTo.Value.AddDays(1));
            }

            if (!String.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Append(" AND (L.logComment LIKE @0 OR N.[text] LIKE @0)", "%" + request.SearchTerm + "%");
            }

            if (request.NodeId.HasValue)
            {
                query = query.Append(" AND L.NodeId = @0", request.NodeId.Value);
            }

            query = query.Append(" ORDER BY " + request.SortColumn + " " + request.SortOrder);

            return db.Page<LogEntry>(request.PageNumber, request.ItemsPerPage, query);
        }

        /// <summary>
        /// Gets a list of all Umbraco users
        /// </summary>
        /// <returns>A list of user names</returns>
        public IEnumerable<string> GetAllUserNames()
        {
            const string sql = "Select userName FROM umbracoUser ORDER BY userName";
            return db.Fetch<string>(sql);
        }

        /// <summary>
        /// Gets a list of all Umbraco users and caches the results for a period
        /// </summary>
        /// <param name="cacheSeconds">The seconds to cache the query for</param>
        /// <returns>A list of user names</returns>
        public IEnumerable<string> GetAllUserNames(int cacheSeconds)
        {
            const string cacheKey = "Diplo.AuditLogService.GetAllUserNames";
            return this.cache.GetCacheItem<IEnumerable<string>>(cacheKey, () => GetAllUserNames(), TimeSpan.FromSeconds(cacheSeconds));
        }

        /// <summary>
        /// Gets the audit log detail for one entry
        /// </summary>
        /// <param name="id">The Id of the row</param>
        /// <returns>A detail record</returns>
        public LogEntryDetail GetLogDetail(int id)
        {
            const string sql = @"SELECT L.Id, L.NodeId as NodeId, CT.icon as Icon, N.[text] as Name, U.id as UserId, U.userName as UserName, U.userEmail as UserEmail, 
			L.Datestamp as DateStamp, L.logHeader as LogType, L.logComment as Comment, 
			CT.Alias as Alias, CT.[description] as Description, L.nodeId  
			FROM umbracoLog L 
			LEFT JOIN umbracoUser U ON L.userId = U.id
			LEFT JOIN cmsDocument D ON L.NodeId = D.nodeId
			LEFT JOIN umbracoNode N ON N.id = L.nodeId
			LEFT JOIN cmsContent C ON C.nodeId = L.nodeId
			LEFT JOIN cmsContentType CT ON C.contentType = CT.nodeId
			WHERE L.Id = @0
			AND (D.newest = 1 OR D.newest IS NULL)";

            return db.Single<LogEntryDetail>(sql, id);
        }

        /// <summary>
        /// Gets the log aliases [not used]
        /// </summary>
        /// <returns>A list of aliases</returns>
        public IEnumerable<string> GetLogAliases()
        {
            const string sql = @"SELECT DISTINCT(CT.alias)
			FROM umbracoLog L 
			LEFT JOIN umbracoUser U ON L.userId = U.id
			LEFT JOIN umbracoNode N ON N.id = L.NodeId
			LEFT JOIN cmsContentType CT ON L.NodeId = CT.nodeId
			WHERE CT.alias IS NOT NULL
			ORDER BY 1";

            return db.Fetch<string>(sql);
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc)
        /// </summary>
        /// <returns>A list of header types</returns>
        public IEnumerable<string> GetLogTypes()
        {
            const string sql = "SELECT DISTINCT logHeader FROM umbracoLog ORDER BY logHeader";
            return db.Fetch<string>(sql);
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc) and caches the query
        /// </summary>
        /// <param name="cacheSeconds">The seconds to cache the results</param>
        /// <returns>A list of header types</returns>
        public IEnumerable<string> GetLogTypes(int cacheSeconds)
        {
            const string cacheKey = "Diplo.AuditLogService.GetLogTypes";
            return this.cache.GetCacheItem<IEnumerable<string>>(cacheKey, () => GetLogTypes(), TimeSpan.FromSeconds(cacheSeconds));
        }

        /// <summary>
        /// Gets the top pages that were last updated that are in the audit log
        /// </summary>
        /// <param name="amount">The maximum number of pages to retrieve</param>
        /// <returns>A page of Umbraco pages</returns>
        public Page<BasicPage> GetLastUpdatedPages(int amount = 10)
        {
            const string sql = @"SELECT D.NodeId, D.Text as Title, D.UpdateDate, CT.Icon from cmsDocument D
            INNER JOIN cmsContent C ON C.nodeId = D.nodeId
            INNER JOIN cmsContentType CT ON C.contentType = CT.nodeId
            WHERE D.newest = 1 
            ORDER BY D.updateDate DESC";

            return db.Page<BasicPage>(1, amount, new Sql(sql));
        }

        /// <summary>
        /// Gets the most active users in the log in last n days
        /// </summary>
        /// <param name="amount">The maximum number of users to retrieve</param>
        /// <param name="daysBack">How many days back in the log to look</param>
        /// <returns>A page of Umbraco users</returns>
        public Page<BasicUser> GetMostActiveUsers(int amount = 10, int daysBack = -30)
        {
            const string sql = @"SELECT U.id, U.userName, Count(u.Id) as UserCount
            FROM umbracoLog L 
            LEFT JOIN umbracoUser U ON L.userId = U.id
            WHERE L.DateStamp > @0
            GROUP BY U.userName, U.id
            ORDER BY UserCount DESC";

            return db.Page<BasicUser>(1, amount, new Sql(sql, DateTime.Today.AddDays(daysBack)));
        }
    }
}
