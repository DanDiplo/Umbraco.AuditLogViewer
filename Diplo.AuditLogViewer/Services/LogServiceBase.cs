using System;
using System.Collections.Generic;
using System.Linq;
using Diplo.AuditLogViewer.Models;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Scoping;

namespace Diplo.AuditLogViewer.Services
{
    /// <summary>
    /// Base class for all log services that handles common functions
    /// </summary>
    public abstract class LogServiceBase
    {
        protected readonly IScopeProvider scopeProvider;
        protected readonly IAppPolicyCache cache;

        /// <summary>
        /// Instantiates the service with a scope and access to caches
        /// </summary>
        /// <param name="scope">The ambient scope</param>
        /// <param name="caches">The Umbraco application caches</param>
        public LogServiceBase(IScopeProvider scopeProvider, AppCaches caches)
        {
            this.scopeProvider = scopeProvider ?? throw new ArgumentNullException(nameof(scopeProvider));
            this.cache = caches?.RuntimeCache ?? throw new ArgumentNullException(nameof(caches));
        }

        /// <summary>
        /// Gets a list of all Umbraco users (which are cached)
        /// </summary>
        /// <returns>A list of users</returns>
        public virtual IEnumerable<BasicUser> GetAllUsers()
        {
            return this.cache.GetCacheItem("Diplo.AuditLogViewer.UserNames", () => GetUsers(), TimeSpan.FromSeconds(120), priority: System.Web.Caching.CacheItemPriority.Low);

            IEnumerable<BasicUser> GetUsers()
            {
                const string sql = "SELECT id, userName FROM umbracoUser ORDER BY userName";

                using (var scope = this.scopeProvider.CreateScope(autoComplete: true))
                {
                    var users = scope.Database.Fetch<BasicUser>(sql);

                    users.Insert(0, new BasicUser()
                    {
                        Id = 0,
                        Username = "SYSTEM"
                    });

                    return users;
                }
            }
        }

        /// <summary>
        /// Override to set the list of valid parameters for ordering items by
        /// </summary>
        protected abstract string[] ValidOrderByParamaters { get; }

        /// <summary>
        /// Validates sort order column parameter is in whitelist (you can't parameterise these in PetaPoco)
        /// </summary>
        /// <param name="param">The sort column parameter to check</param>
        /// <returns>True if it is; otherwise false</returns>
        protected bool IsValidOrderByParameter(string param)
        {
            return ValidOrderByParamaters.Contains(param, StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Validates sort order direction is in whitelist (you can't parameterise these in PetaPoco)
        /// </summary>
        /// <param name="param">The sort order parameter to check</param>
        /// <returns>True if it is; otherwise false</returns>
        protected bool IsValidOrderByDirectionParameter(string param)
        {
            return param.InvariantEquals("asc") || param.InvariantEquals("desc");
        }
    }
}
