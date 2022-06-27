using System.Collections.Generic;
using Diplo.AuditLogViewer.Models;
using NPoco;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Implement for any service that gets data from the umbraco Audit table
    /// </summary>
    public interface IAuditLogService
    {
        IEnumerable<string> GetEventTypes();

        Page<AuditEntry> SearchLog(AuditLogSearchRequest request);

        IEnumerable<BasicUser> GetAllUsers();
    }
}