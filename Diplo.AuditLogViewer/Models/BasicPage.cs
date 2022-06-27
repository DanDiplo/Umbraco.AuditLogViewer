using System;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents the basic properties for a "page"
    /// </summary>
    public class BasicPage
    {
        public int NodeId { get; set; }

        public string Title { get; set; }

        public DateTime UpdateDate { get; set; }

        public string Icon { get; set; }
    }
}