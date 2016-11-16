using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Diplo.AuditLogViewer.Models;
using Diplo.AuditLogViewer.Services;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence;
using Umbraco.Web.Editors;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;
using Umbraco.Web.WebApi.Filters;

namespace Diplo.AuditLogViewer.Controllers
{
    // see http://24days.in/umbraco/2015/custom-listview/

    [UmbracoApplicationAuthorize(Constants.Applications.Developer)]
    [PluginController("AuditLogViewer")]
    public class AuditLogController : UmbracoAuthorizedJsonController
    {
        private readonly LogService logService;

        public AuditLogController()
        {
            this.logService = new LogService(UmbracoContext.Application.DatabaseContext.Database, UmbracoContext.Application.ApplicationCache.RuntimeCache);
        }

        /// <summary>
        /// Gets the audit log data for the specified parameters
        /// </summary>
        /// <param name="logType">The type of the log entry (eg. 'Save')</param>
        /// <param name="userName">Name of the user responsible for the entry</param>
        /// <param name="dateFrom">The date to search from</param>
        /// <param name="searchTerm">An optional search term</param>
        /// <param name="dateTo">The date to search up to (inclusive)</param>
        /// <param name="itemsPerPage">How many items per page to retrieve</param>
        /// <param name="nodeId">The optional nodeId to search for</param>
        /// <param name="pageNumber">The page number</param>
        /// <param name="sortColumn">The column name to sort by</param>
        /// <param name="sortOrder">The sort order - either ascending or descending</param>
        /// <returns>A paged list of log data</returns>
        /// <remarks>/Umbraco/Backoffice/AuditLogViewer/AuditLog/GetLogData</remarks>
        public PagedLogEntryResult GetLogData(string logType = null, string userName = null, DateTime? dateFrom = null, DateTime? dateTo = null, int? nodeId = null, int itemsPerPage = 50, int pageNumber = 1, string sortColumn = "DateStamp", string sortOrder = "asc", string searchTerm = null)
        {
            var request = new LogSearchRequest()
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

            var paged = this.logService.SearchAuditLog(request);

            PagedLogEntryResult result = new PagedLogEntryResult()
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
            return this.logService.GetAllUserNames(60);
        }

        /// <summary>
        /// Gets the audit log detail for one entry
        /// </summary>
        /// <param name="id">The Id of the row</param>
        /// <returns>A detail record</returns>
		public LogEntryDetail GetLogDetail(int id)
        {
            return this.logService.GetLogDetail(id);
        }

        /// <summary>
        /// Gets the log aliases [not used]
        /// </summary>
        /// <returns>A list of aliases</returns>
		public IEnumerable<string> GetLogAliases()
        {
            return this.logService.GetLogAliases();
        }

        /// <summary>
        /// Gets the distinct log header types (eg. Save, Publish etc)
        /// </summary>
        /// <returns>A list of header types</returns>
		public IEnumerable<string> GetLogTypes()
        {
            return this.logService.GetLogTypes(60);
        }
    }
}
