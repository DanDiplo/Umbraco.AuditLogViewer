using System;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents a row from the umbracoAudit table
    /// </summary>
    public class AuditEntry
    {
        public int Id { get; set; }

        public int PerformingUserId { get; set; }

        public string PerformingDetails { get; set; }

        public string PerformingIP { get; set; }

        public DateTime EventDateUtc { get; set; }

        public int AffectedUserId { get; set; }

        public string AffectedDetails { get; set; }

        public string EventType { get; set; }

        public string EventDetails { get; set; }
    }
}
