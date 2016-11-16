using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Diplo.AuditLogViewer.Models
{
    public class PagedLogEntryResult
    {
        public List<LogEntry> LogEntries { get; set; }

        public long CurrentPage { get; set; }

        public long ItemsPerPage { get; set; }

        public long TotalPages { get; set; }

        public long TotalItems { get; set; }
    }
}
