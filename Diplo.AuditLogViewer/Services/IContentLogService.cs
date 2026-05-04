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

        IEnumerable<string> GetEntityTypes();

        IEnumerable<LoggedNodeSuggestion> SearchLoggedNodes(string? term, int take = 10);

        Page<LogEntry> SearchLog(ContentLogSearchRequest request);
    }
}
