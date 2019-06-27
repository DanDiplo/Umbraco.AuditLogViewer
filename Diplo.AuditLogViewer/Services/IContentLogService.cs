using System.Collections.Generic;
using Diplo.AuditLogViewer.Models;
using NPoco;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Implement for any service that queries the content (umbracoLog) table
    /// </summary>
    public interface IContentLogService
    {
        IEnumerable<BasicUser> GetAllUsers();

        IEnumerable<BasicPage> GetLastUpdatedPages(int amount = 10);

        IEnumerable<string> GetLogAliases();

        IEnumerable<string> GetLogTypes();

        Page<LogEntry> SearchLog(ContentLogSearchRequest request);
    }
}