using System;

namespace Diplo.AuditLogViewer.Models
{
    /// <summary>
    /// Represents a node that appears in the content log.
    /// </summary>
    public sealed class LoggedNodeSuggestion
    {
        public int NodeId { get; set; }

        public Guid? UniqueId { get; set; }

        public bool NodeExists { get; set; }

        public string? Name { get; set; }

        public string? EntityType { get; set; }
    }
}
