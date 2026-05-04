namespace Diplo.AuditLogViewer
{
    /// <summary>
    /// Settings and constants
    /// </summary>
    public static class AuditSettings
    {
        /// <summary>
        /// The appsettings section name for package configuration.
        /// </summary>
        public const string ConfigSectionName = "AuditLogViewer";

        /// <summary>
        /// The MVC plugin area name for controllers
        /// </summary>
        public const string PluginAreaName = "DiploAuditLogViewer";

        /// <summary>
        /// The audit trail tree alias
        /// </summary>
        public const string AuditTrailAlias = "diploAuditTrail";

        /// <summary>
        /// The content log tree alias
        /// </summary>
        public const string ContentLogAlias = "diploContentLog";
    }

    /// <summary>
    /// Configurable package options bound from appsettings.
    /// </summary>
    public sealed class AuditLogViewerOptions
    {
        /// <summary>
        /// Gets or sets whether CSV export controls are hidden in the backoffice UI.
        /// </summary>
        public bool DisableExport { get; set; }
    }
}
