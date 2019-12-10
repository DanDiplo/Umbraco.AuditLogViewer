using System;
using System.Collections.Generic;
using Diplo.AuditLogViewer.Models;
using Diplo.AuditLogViewer.Services;
using Umbraco.Core;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi.Filters;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Controller for returning log data as JSON to authenticated developers
    /// </summary>
    [UmbracoApplicationAuthorize(Constants.Applications.Developer)]
    [PluginController("AuditLogViewer")]
    public class AuditTrailController : UmbracoAuthorizedJsonController
    {
        private readonly AuditLogService _logService;

        /// <summary>
        /// Instantiate a new audit log controller and configure the log service with the Umbraco database
        /// </summary>
        public AuditTrailController()
        {
            this._logService = new AuditLogService(UmbracoContext.Application.DatabaseContext.Database, UmbracoContext.Application.ApplicationCache.RuntimeCache);
        }

        /// <summary>
        /// Gets the audit log data for the specified filter parameters
        /// </summary>
        /// <param name="affectedUserId">The user Id who was affected by an action</param>
        /// <param name="performingUserId">The user Id who performed the action</param>
        /// <param name="dateFrom">The date to search from</param>
        /// <param name="searchTerm">An optional search term</param>
        /// <param name="dateTo">The date to search up to (inclusive)</param>
        /// <param name="itemsPerPage">How many items per page to retrieve (default = 50)</param>
        /// <param name="pageNumber">The page number</param>
        /// <param name="sortColumn">The column name to sort by (default = date)</param>
        /// <param name="sortOrder">The sort order - either ascending or descending (default = ascending)</param>
        /// <returns>A paged list of log data</returns>
        /// <remarks>/Umbraco/Backoffice/AuditLogViewer/AuditLog/GetLogData</remarks>
        public PagedLogEntryResult<AuditEntry> GetLogData(string eventType = null, int? performingUserId = null, int? affectedUserId = null, DateTime? dateFrom = null, DateTime? dateTo = null, int itemsPerPage = 50, int pageNumber = 1, string sortColumn = "eventDateUtc", string sortOrder = "asc", string searchTerm = null)
        {
            var request = new AuditLogSearchRequest()
            {
                EventType = eventType,
                PerformingUserId = performingUserId,
                AffectedUserId = affectedUserId,
                DateFrom = dateFrom,
                DateTo = dateTo,
                ItemsPerPage = itemsPerPage,
                PageNumber = pageNumber,
                SearchTerm = searchTerm,
                SortColumn = sortColumn,
                SortOrder = sortOrder
            };

            var paged = this._logService.SearchLog(request);

            var result = new PagedLogEntryResult<AuditEntry>()
            {
                CurrentPage = paged.CurrentPage,
                ItemsPerPage = paged.ItemsPerPage,
                LogEntries = paged.Items,
                TotalItems = paged.TotalItems,
                TotalPages = paged.TotalPages
            };

            return result;
        }

        /// <summary>
        /// Gets a list of all Umbraco users
        /// </summary>
        /// <returns>A list of users</returns>
		public IEnumerable<BasicUser> GetAllUserNames()
        {
            return this._logService.GetAllUsers();
        }

        /// <summary>
        /// Gets the types of event
        /// </summary>
        /// <returns>A list of event types</returns>
        public IEnumerable<string> GetEventTypes()
        {
            return this._logService.GetEventTypes(60);
        }
    }
}
