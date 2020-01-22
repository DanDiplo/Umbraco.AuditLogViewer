using System;

namespace Diplo.AuditLogViewer.Models
{
    public class BasicPage
    {
        public int NodeId { get; set; }

        public string Title { get; set; }

        public DateTime UpdateDate { get; set; }

        public string Icon { get; set; }
    }
}
