using System;
using System.Net.Http.Formatting;
using System.Web.Http.ModelBinding;
using Umbraco.Core;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Trees;
using Umbraco.Web.WebApi.Filters;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Base controller for both Audit and Content trees within the Umbraco Settings section. Deals with common things, like generating date filters etc.
    /// </summary>
    /// <remarks>
    /// See https://our.umbraco.com/Documentation/Extending/Section-Trees/trees
    /// </remarks>
    public abstract class BaseTreeController : TreeController
    {
        protected abstract override TreeNodeCollection GetTreeNodes(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormDataCollection queryStrings);

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
                menu.Items.Add(new RefreshNode(Services.TextService, true)); // adds refresh link to right-click
            }

            return menu;
        }

        /// <summary>
        /// Adds the date filters to the tree
        /// </summary>
        protected void AddDateRangeTree(TreeNodeCollection tree, string id, FormDataCollection qs)
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
            string dateRange = string.Format("date:{0:yyyy-MM-dd}:{1:yyyy-MM-dd}", from, to);
            return CreateTreeNode(dateRange, id, qs, label, "icon-calendar");
        }
    }
}
