namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Used to represent the criteria for searching the umbracoLog table
    /// </summary>
    public class ContentLogSearchRequest : SearchRequestBase
    {
        public ContentLogSearchRequest()
        {
            this.SortColumn = "DateStamp";
        }

        public string LogType { get; set; }

        public string UserName { get; set; }

        public int? NodeId { get; set; }
    }
}