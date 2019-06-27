using Diplo.AuditLogViewer.Services;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Diplo.AuditLogViewer.Composers
{
    /// <summary>
    /// Used to register the log services with DI
    /// </summary>
    /// <remarks>
    /// See https://our.umbraco.com/Documentation/Reference/using-ioc
    /// </remarks>
    public class LogComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.Register<IContentLogService, ContentLogService>();
            composition.Register<IAuditLogService, AuditLogService>();
        }
    }
}
