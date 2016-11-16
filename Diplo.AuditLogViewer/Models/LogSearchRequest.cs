using System;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Used to represent the criteria for searching the log table
    /// </summary>
    public class LogSearchRequest
    {
        public LogSearchRequest()
        {
            this.ItemsPerPage = 50;
            this.PageNumber = 1;
            this.SortColumn = "DateStamp";
            this.SortOrder = "asc";
        }

        public string LogType { get; set; }

        public string UserName { get; set; }

        public DateTime? DateFrom { get; set; }

        public DateTime? DateTo { get; set; }

        public int? NodeId { get; set; }

        public int ItemsPerPage { get; set; }

        public int PageNumber { get; set; }

        public string SortColumn { get; set; }

        public string SortOrder { get; set; }

        public string SearchTerm { get; set; }
    }
}
