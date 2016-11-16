using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents a log entry row
    /// </summary>
    public class LogEntry
    {
        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the name of the user.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Gets or sets the date stamp.
        /// </summary>
        public DateTime DateStamp { get; set; }

        /// <summary>
        /// Gets or sets the type of the log.
        /// </summary>
        public string LogType { get; set; }

        /// <summary>
        /// Gets or sets the comment.
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// Gets or sets the Node Id
        /// </summary>
        public int NodeId { get; set; }
    }
}
