using System.Net.Http.Formatting;
using Diplo.AuditLogViewer.Services;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Scoping;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Mvc;
using Umbraco.Web.Trees;
using Umbraco.Web.WebApi.Filters;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Tree Controller that generates the audit log tree within the Umbraco Settings section
    /// </summary>
    [Tree(Constants.Applications.Settings, treeAlias: AuditSettings.ContentLogAlias, TreeTitle = "Content Audit Logs", TreeGroup = Constants.Trees.Groups.ThirdParty, SortOrder = 10)]
    [UmbracoApplicationAuthorize(Constants.Applications.Settings)]
    [PluginController(AuditSettings.PluginAreaName)]
    public class ContentLogTreeController : BaseTreeController
    {
        private readonly ContentLogService contentLog;

        /// <summary>
        /// Instantiates the controller with the content log service
        /// </summary>
        public ContentLogTreeController(IScopeProvider scopeProvider, AppCaches caches)
        {
            this.contentLog = new ContentLogService(scopeProvider, caches);
        }

        /// <summary>
        /// Enables the root node to load the main content log edit view
        /// </summary>
        protected override TreeNode CreateRootNode(FormDataCollection queryStrings)
        {
            var root = base.CreateRootNode(queryStrings);
            root.RoutePath = string.Format("{0}/{1}/{2}", Constants.Applications.Settings, AuditSettings.ContentLogAlias, "edit/AuditLog");
            root.Icon = "icon-server-alt";
            root.HasChildren = true;
            root.MenuUrl = null;

            return root;
        }

        /// <summary>
        /// Gets the nodes that form the tree
        /// </summary>
        /// <param name="id">The tree identifier</param>
        /// <param name="qs">Any posted parameters</param>
        /// <returns>A collection of tree nodes</returns>
        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection qs)
        {
            var tree = new TreeNodeCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                tree.Add(CreateTreeNode("AuditLog", id, qs, "Search Content Logs", "icon-search"));
                tree.Add(CreateTreeNode("TimePeriod", id, qs, "Time Period", "icon-folder", true));
                tree.Add(CreateTreeNode("LatestPages", id, qs, "Latest Pages", "icon-folder", true));
            }

            if (id == "TimePeriod")
            {
                this.AddDateRangeTree(tree, id, qs);
            }

            if (id == "LatestPages")
            {
                this.AddLatestPagesTree(tree, id, qs);
            }

            return tree;
        }

        private void AddLatestPagesTree(TreeNodeCollection tree, string id, FormDataCollection qs)
        {
            var latest = this.contentLog.GetLastUpdatedPages(10);

            foreach (var item in latest)
            {
                tree.Add(CreateTreeNode("node:" + item.NodeId, id, qs, item.Title, item.Icon));
            }
        }
    }
}
