namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Used to represent the criteria for searching the audit data table
    /// </summary>
    public class AuditLogSearchRequest : SearchRequestBase
    {
        public AuditLogSearchRequest()
        {
            this.SortColumn = "eventDateUtc";
        }

        public int? PerformingUserId { get; set; }

        public int? AffectedUserId { get; set; }

        public string EventType { get; set; }
    }
}
