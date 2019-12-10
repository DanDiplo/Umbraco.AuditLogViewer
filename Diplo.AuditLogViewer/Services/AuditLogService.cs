using System;
using System.Collections.Generic;
using System.Linq;
using Diplo.AuditLogViewer.Models;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Persistence;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Service for querying log and related data
    /// </summary>
    public class AuditLogService
    {
        private readonly UmbracoDatabase db;
        private readonly IRuntimeCacheProvider cache;

        /// <summary>
        /// Instantiates the log service with the Umbraco database and a caching provider
        /// </summary>
        /// <param name="db">The Umbraco database</param>
        /// <param name="cache">A caching provider</param>
        public AuditLogService(UmbracoDatabase db, IRuntimeCacheProvider cache)
        {
            if (db == null)
                throw new ArgumentNullException("db");

            this.db = db;
            this.cache = cache;
        }

        /// <summary>
        /// Searches the Audit Log table
        /// </summary>
        /// <param name="request">The search request criteria</param>
        /// <returns>A page of log results</returns>
        public Page<AuditEntry> SearchLog(AuditLogSearchRequest request)
        {
            if (!IsValidOrderByParameter(request.SortColumn))
                throw new ArgumentOutOfRangeException("The order by value '" + request.SortColumn + "' is not a valid sort parameter.");

            if (!IsValidOrderByDirectionParameter(request.SortOrder))
                throw new ArgumentOutOfRangeException("The order by value '" + request.SortOrder + "' is not a valid sort order.");

            const string sqlBase = @"SELECT id, performingUserId, performingDetails, performingIp, eventDateUtc, affectedUserId, affectedDetails, eventType, eventDetails
                                    FROM umbracoAudit WHERE 1 = 1";

            Sql query = new Sql(sqlBase);

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

            return db.Page<AuditEntry>(request.PageNumber, request.ItemsPerPage, query);
        }

        /// <summary>
        /// Gets a list of all Umbraco users
        /// </summary>
        /// <returns>A list of usera</returns>
        public IEnumerable<BasicUser> GetAllUsers()
        {
            const string sql = "SELECT id, userName FROM umbracoUser ORDER BY userName";
            var users =  db.Fetch<BasicUser>(sql);

            users.Insert(0, new BasicUser()
            {
                Id = 0,
                Username = "SYSTEM"
            });

            return users;
        }

        /// <summary>
        /// Gets a list of all Umbraco users and caches the results for a period
        /// </summary>
        /// <param name="cacheSeconds">The seconds to cache the query for</param>
        /// <returns>A list of users</returns>
        public IEnumerable<BasicUser> GetAllUserNames(int cacheSeconds)
        {
            const string cacheKey = "Diplo.AuditLogService.GetAllUserNames";
            return this.cache.GetCacheItem<IEnumerable<BasicUser>>(cacheKey, () => GetAllUsers(), TimeSpan.FromSeconds(cacheSeconds));
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc)
        /// </summary>
        /// <returns>A list of header types</returns>
        public IEnumerable<string> GetEventTypes()
        {
            const string sql = "SELECT DISTINCT eventType FROM umbracoAudit ORDER BY eventType";
            return db.Fetch<string>(sql);
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc) and caches the query
        /// </summary>
        /// <param name="cacheSeconds">The seconds to cache the results</param>
        /// <returns>A list of header types</returns>
        public IEnumerable<string> GetEventTypes(int cacheSeconds)
        {
            const string cacheKey = "Diplo.AuditLogService.GetEventTypes";
            return this.cache.GetCacheItem<IEnumerable<string>>(cacheKey, () => GetEventTypes(), TimeSpan.FromSeconds(cacheSeconds));
        }

        /// <summary>
        /// Validates sort order column parameter is in whitelist (you can't parameterise these in PetaPoco)
        /// </summary>
        /// <param name="param">The sort column parameter to check</param>
        /// <returns>True if it is; otherwise false</returns>
        private bool IsValidOrderByParameter(string param)
        {
            return ValidOrderByParamaters.Contains(param, StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Validates sort order direction is in whitelist (you can't parameterise these in PetaPoco)
        /// </summary>
        /// <param name="param">The sort order parameter to check</param>
        /// <returns>True if it is; otherwise false</returns>
        private bool IsValidOrderByDirectionParameter(string param)
        {
            return param.InvariantEquals("asc") || param.InvariantEquals("desc");
        }

        private static readonly string[] ValidOrderByParamaters = new string[]
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
