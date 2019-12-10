using System.Collections.Generic;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents a "page" of log entries
    /// </summary>
    /// <typeparam name="T">The type being pages</typeparam>
    public class PagedLogEntryResult<T>
    {
        public List<T> LogEntries { get; set; }

        public long CurrentPage { get; set; }

        public long ItemsPerPage { get; set; }

        public long TotalPages { get; set; }

        public long TotalItems { get; set; }
    }
}
