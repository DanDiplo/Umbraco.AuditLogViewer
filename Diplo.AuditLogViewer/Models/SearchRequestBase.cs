using System;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Base class for search requests
    /// </summary>
    public abstract class SearchRequestBase
    {
        public SearchRequestBase()
        {
            this.ItemsPerPage = 50;
            this.PageNumber = 1;
            this.SortOrder = "asc";
        }

        public DateTime? DateFrom { get; set; }

        public DateTime? DateTo { get; set; }

        public int ItemsPerPage { get; set; }

        public int PageNumber { get; set; }

        public string SortColumn { get; set; }

        public string SortOrder { get; set; }

        public string SearchTerm { get; set; }
    }
}
