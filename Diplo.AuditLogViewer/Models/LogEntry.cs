using System;
using NPoco;

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
        /// Gets or sets the unique key of the content node.
        /// </summary>
        public Guid? UniqueId { get; set; }

        /// <summary>
        /// Gets or sets whether the logged node still exists in the node table.
        /// </summary>
        public bool NodeExists { get; set; }

        /// <summary>
        /// Gets or sets the text name.
        /// </summary>
        public string? Text { get; set; }

        /// <summary>
        /// Gets or sets the name of the user.
        /// </summary>
        public string? UserName { get; set; }

        /// <summary>
        /// Gets or sets the date stamp.
        /// </summary>
        public DateTime DateStamp { get; set; }

        /// <summary>
        /// Gets or sets the type of the log header eg. Publish
        /// </summary>
        public string? LogHeader { get; set; }

        /// <summary>
        /// Gets or sets the comment.
        /// </summary>
        public string? LogComment { get; set; }

        /// <summary>
        /// Gets or sets additional log parameters recorded by Umbraco.
        /// </summary>
        public string? Parameters { get; set; }

        /// <summary>
        /// Gets or sets the entity type recorded in the log table.
        /// </summary>
        public string? EntityType { get; set; }

        /// <summary>
        /// Gets or sets the Node Id
        /// </summary>
        public int NodeId { get; set; }

        /// <summary>
        /// Gets the document type alias if it has one
        /// </summary>
        public string? Alias { get; set; }

        /// <summary>
        /// Gets the object type this represents as a GUID
        /// </summary>
        [Column(Name = "NodeObjectType")]
        public Guid? TypeId { get; set; }

        /// <summary>
        /// Gets the human-readable form of the object type
        /// </summary>
        public string? TypeDesc { get; set; }

        /// <summary>
        /// Gets the Icon used for any content
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// Gets whether the item is open or not - used in the view
        /// </summary>
        public bool IsOpen { get; set; }
    }
}
