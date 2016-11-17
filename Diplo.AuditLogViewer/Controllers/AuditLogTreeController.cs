using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Formatting;
using System.Web;
using System.Web.Http;
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
    /// Diplo AuditLog Tree Controller
    /// </summary>
    [UmbracoApplicationAuthorize(Constants.Applications.Developer)]
    [Tree(Constants.Applications.Developer, "diploAuditLog", "Audit Logs", sortOrder: 10)]
    [PluginController("DiploAuditLogViewer")]
    public class AuditLogTreeController : TreeController
    {
        private readonly LogService logService;

        public AuditLogTreeController()
        {
            this.logService = new LogService(UmbracoContext.Application.DatabaseContext.Database, UmbracoContext.Application.ApplicationCache.RuntimeCache);
        }

        protected override TreeNodeCollection GetTreeNodes(string id, FormDataCollection qs)
        {
            TreeNodeCollection tree = new TreeNodeCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                tree.Add(CreateTreeNode("AuditLog", id, qs, "Search Audit Logs", "icon-search"));
                tree.Add(CreateTreeNode("TimePeriod", id, qs, "Time Period", "icon-folder", true));
                tree.Add(CreateTreeNode("LatestPages", id, qs, "Latest Pages", "icon-folder", true));
                tree.Add(CreateTreeNode("ActiveUsers", id, qs, "Active Users", "icon-folder", true));
            }

            if (id == "TimePeriod")
            {
                tree.Add(AddDateRangeTreeNode(id, qs, "Today", DateTime.Today, DateTime.Today));
                tree.Add(AddDateRangeTreeNode(id, qs, "Yesterday", DateTime.Today.AddDays(-1), DateTime.Today.AddDays(-1)));
                tree.Add(AddDateRangeTreeNode(id, qs, DateTime.Today.AddDays(-2).ToString("dddd"), DateTime.Today.AddDays(-2), DateTime.Today.AddDays(-2)));
                tree.Add(AddDateRangeTreeNode(id, qs, DateTime.Today.AddDays(-3).ToString("dddd"), DateTime.Today.AddDays(-3), DateTime.Today.AddDays(-3)));
                tree.Add(AddDateRangeTreeNode(id, qs, DateTime.Today.AddDays(-4).ToString("dddd"), DateTime.Today.AddDays(-4), DateTime.Today.AddDays(-4)));
                tree.Add(AddDateRangeTreeNode(id, qs, "This week", DateTime.Today.AddDays(-7), DateTime.Today));
                tree.Add(AddDateRangeTreeNode(id, qs, "Previous week", DateTime.Today.AddDays(-14), DateTime.Today.AddDays(-7)));
                tree.Add(AddDateRangeTreeNode(id, qs, "Within 30 days", DateTime.Today.AddDays(-30), DateTime.Today));
                tree.Add(AddDateRangeTreeNode(id, qs, "Within 180 days", DateTime.Today.AddDays(-180), DateTime.Today));
                tree.Add(AddDateRangeTreeNode(id, qs, "This year", DateTime.Today.AddYears(-1), DateTime.Today));
            }

            if (id == "LatestPages")
            {
                this.AddLatestPagesTree(tree, id, qs);
            }

            if (id == "ActiveUsers")
            {
                this.AddActiveUsersTree(tree, id, qs);
            }

            return tree;
        }

        protected override MenuItemCollection GetMenuForNode(string id, FormDataCollection queryStrings)
        {
            var menu = new MenuItemCollection();

            if (id == Constants.System.Root.ToInvariantString())
            {
                menu.Items.Add<RefreshNode, ActionRefresh>("Reload", true);
            }

            return menu;
        }

        private TreeNode AddDateRangeTreeNode(string id, FormDataCollection qs, string label,  DateTime from, DateTime to)
        {
            string dateRange = String.Format("date:{0:yyyy-MM-dd}:{1:yyyy-MM-dd}", from, to);
            return CreateTreeNode(dateRange, id, qs, label, "icon-calendar");
        }

        private void AddLatestPagesTree(TreeNodeCollection tree, string id, FormDataCollection qs)
        {
            var paged = this.logService.GetLastUpdatedPages(10);

            foreach (var item in paged.Items)
            {
                tree.Add(CreateTreeNode("node:" + item.NodeId, id, qs, item.Title, item.Icon));
            }
        }

        private void AddActiveUsersTree(TreeNodeCollection tree, string id, FormDataCollection qs)
        {
            var paged = this.logService.GetMostActiveUsers(10, -30);

            foreach (var item in paged.Items)
            {
                tree.Add(CreateTreeNode("user:" + item.Username, id, qs, item.Username, "icon-user"));
            }
        }
    }
}
