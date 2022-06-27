using Diplo.AuditLogViewer.Models;
using Diplo.AuditLogViewer.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.Common.Attributes;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Controller for returning log data as JSON to authenticated developers
    /// </summary>
    [PluginController(AuditSettings.PluginAreaName)]
    public class ContentLogController : UmbracoAuthorizedJsonController
    {
        private readonly IContentLogService _logService;

        /// <summary>
        /// Instantiate a new audit log controller with the configured <see cref="IContentLogService"/>
        /// </summary>
        public ContentLogController(IContentLogService logService)
        {
            this._logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        /// <summary>
        /// Gets the audit log data for the specified filter parameters
        /// </summary>
        /// <param name="logType">The type of the log entry (eg. 'Save')</param>
        /// <param name="userName">Name of the user responsible for the entry</param>
        /// <param name="dateFrom">The date to search from</param>
        /// <param name="searchTerm">An optional search term</param>
        /// <param name="dateTo">The date to search up to (inclusive)</param>
        /// <param name="itemsPerPage">How many items per page to retrieve (default = 50)</param>
        /// <param name="nodeId">The optional nodeId to search for</param>
        /// <param name="pageNumber">The page number</param>
        /// <param name="sortColumn">The column name to sort by (default = date)</param>
        /// <param name="sortOrder">The sort order - either ascending or descending (default = ascending)</param>
        /// <returns>A paged list of log data</returns>
        /// <remarks>/Umbraco/Backoffice/AuditLogViewer/ContentLog/GetLogData</remarks>
        public PagedLogEntryResult<LogEntry> GetLogData(string logType = null, string userName = null, DateTime? dateFrom = null, DateTime? dateTo = null, int? nodeId = null, int itemsPerPage = 50, int pageNumber = 1, string sortColumn = "L.Datestamp", string sortOrder = "asc", string searchTerm = null)
        {
            var request = new ContentLogSearchRequest()
            {
                DateFrom = dateFrom,
                DateTo = dateTo,
                ItemsPerPage = itemsPerPage,
                LogType = logType,
                NodeId = nodeId,
                PageNumber = pageNumber,
                SearchTerm = searchTerm,
                SortColumn = sortColumn,
                SortOrder = sortOrder,
                UserName = userName
            };

            var paged = this._logService.SearchLog(request);

            var result = new PagedLogEntryResult<LogEntry>()
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
        /// <returns>A list of user names</returns>
        public IEnumerable<string> GetAllUserNames()
        {
            return this._logService.GetAllUsers().Select(u => u.Username);
        }

        /// <summary>
        /// Gets the log aliases [not used]
        /// </summary>
        /// <returns>A list of aliases</returns>
        public IEnumerable<string> GetLogAliases()
        {
            return this._logService.GetLogAliases();
        }

        /// <summary>
        /// Gets the log audit types (eg. Save, Publish etc)
        /// </summary>
        /// <returns>A list of audit types</returns>
        public IEnumerable<string> GetLogTypes()
        {
            return this._logService.GetLogTypes();
        }
    }
}
