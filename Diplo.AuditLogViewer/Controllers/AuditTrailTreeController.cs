using System;
using System.Net.Http.Formatting;
using Diplo.AuditLogViewer.Services;
using umbraco.BusinessLogic.Actions;
using Umbraco.Core;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Mvc;
using Umbraco.Web.Trees;
using Umbraco.Web.WebApi.Filters;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Controller that controls generation of the audit log tree within the developer section
    /// </summary>
    [UmbracoApplicationAuthorize(Constants.Applications.Developer)]
    [Tree(Constants.Applications.Developer, AuditSettings.AuditTrailAlias, "Audit Trail Logs", sortOrder: 11)]
    [PluginController(AuditSettings.PluginAreaName)]
    public class AuditTrailTreeController : TreeController
    {
        private readonly ContentLogService logService;

        /// <summary>
        /// Instantaies the controller with the log service
        /// </summary>
        public AuditTrailTreeController()
        {
            this.logService = new ContentLogService(UmbracoContext.Application.DatabaseContext.Database, UmbracoContext.Application.ApplicationCache.RuntimeCache);
        }

        /// <summary>
        /// Gets the nodes that form the tree
        /// </summary>
        /// <param name="id">The tree identifier</param>
        /// <param name="qs">Any posted parameters</param>
        /// <returns>A collection of tree nodes</returns>
        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection qs)
        {
            TreeNodeCollection tree = new TreeNodeCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                tree.Add(CreateTreeNode("AuditTrail", id, qs, "Search Audit Trail", "icon-search"));
                tree.Add(CreateTreeNode("TimePeriod", id, qs, "Time Period", "icon-folder", true));
            }

            if (id == "TimePeriod")
            {
                this.AddDateRangeTree(tree, id, qs);
            }

            return tree;
        }

        /// <summary>
        /// Gets the menu items that form the right-click menu
        /// </summary>
        /// <param name="id">The tree identifier</param>
        /// <param name="qs">Any posted parameters</param>
        /// <returns>The menu items</returns>
        protected override MenuItemCollection GetMenuForNode(string id, FormDataCollection qs)
        {
            var menu = new MenuItemCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                menu.Items.Add<RefreshNode, ActionRefresh>("Reload", true);
            }

            return menu;
        }

        private void AddDateRangeTree(TreeNodeCollection tree, string id, FormDataCollection qs)
        {
            tree.Add(AddDateRangeNode(id, qs, "Today", DateTime.Today, DateTime.Today));
            tree.Add(AddDateRangeNode(id, qs, "Yesterday", DateTime.Today.AddDays(-1), DateTime.Today.AddDays(-1)));
            tree.Add(AddDateRangeNode(id, qs, DateTime.Today.AddDays(-2).ToString("dddd"), DateTime.Today.AddDays(-2), DateTime.Today.AddDays(-2)));
            tree.Add(AddDateRangeNode(id, qs, DateTime.Today.AddDays(-3).ToString("dddd"), DateTime.Today.AddDays(-3), DateTime.Today.AddDays(-3)));
            tree.Add(AddDateRangeNode(id, qs, DateTime.Today.AddDays(-4).ToString("dddd"), DateTime.Today.AddDays(-4), DateTime.Today.AddDays(-4)));
            tree.Add(AddDateRangeNode(id, qs, "This week", DateTime.Today.AddDays(-7), DateTime.Today));
            tree.Add(AddDateRangeNode(id, qs, "Previous week", DateTime.Today.AddDays(-14), DateTime.Today.AddDays(-7)));
            tree.Add(AddDateRangeNode(id, qs, "Within 30 days", DateTime.Today.AddDays(-30), DateTime.Today));
            tree.Add(AddDateRangeNode(id, qs, "Within 180 days", DateTime.Today.AddDays(-180), DateTime.Today));
            tree.Add(AddDateRangeNode(id, qs, "This year", DateTime.Today.AddYears(-1), DateTime.Today));
        }

        private TreeNode AddDateRangeNode(string id, FormDataCollection qs, string label, DateTime from, DateTime to)
        {
            string dateRange = String.Format("date:{0:yyyy-MM-dd}:{1:yyyy-MM-dd}", from, to);
            return CreateTreeNode(dateRange, id, qs, label, "icon-calendar");
        }
    }
}
