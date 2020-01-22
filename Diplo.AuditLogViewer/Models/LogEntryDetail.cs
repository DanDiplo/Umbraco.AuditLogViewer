namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents a log entry detail record
    /// </summary>
    public class LogEntryDetail : LogEntry
    {
        /// <summary>
        /// Gets or sets the icon name.
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        public string UserEmail { get; set; }

        /// <summary>
        /// Gets or sets the user's Id
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Gets or sets the doc type alias.
        /// </summary>
        public string Alias { get; set; }

        /// <summary>
        /// Gets or sets the alias description.
        /// </summary>
        public string Description { get; set; }
    }

}
