using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Diplo.AuditLogViewer
{
    /// <summary>
    /// Settings and constants
    /// </summary>
    public static class AuditSettings
    {
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
        public const string ContentLogAlias = "diploAuditLog";
    }
}
