using Diplo.AuditLogViewer.Services;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Diplo.AuditLogViewer.Composers
{
    /// <summary>
    /// Used to register the log services with DI
    /// </summary>
    public class LogComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddScoped<IContentLogService, ContentLogService>();
            builder.Services.AddScoped<IAuditLogService, AuditLogService>();
        }
    }
}
