using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.ModelBinders;

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
        protected readonly IMenuItemCollectionFactory _menuItemCollectionFactory;

        protected BaseTreeController(ILocalizedTextService localizedTextService, UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection, IEventAggregator eventAggregator, IMenuItemCollectionFactory menuItemCollectionFactory)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator)
        {
            this._menuItemCollectionFactory = menuItemCollectionFactory;
        }


        protected override ActionResult<MenuItemCollection> GetMenuForNode(string id, [ModelBinder(typeof(HttpQueryStringModelBinder))] FormCollection queryStrings)
        {
            return this._menuItemCollectionFactory.Create();
        }

        /// <summary>
        /// Adds the date filters to the tree
        /// </summary>
        protected void AddDateRangeTree(TreeNodeCollection tree, string id, FormCollection qs)
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

        /// <summary>
        /// Creates a single tree node without the right-click menu
        /// </summary>
        /// <param name="id">The Id</param>
        /// <param name="parentId">The parent Id</param>
        /// <param name="qs">QueryString params</param>
        /// <param name="title">The node title</param>
        /// <param name="icon">The icon name</param>
        /// <param name="hasChildren">Whether this node has child nodes beneath it</param>
        /// <returns>A tree node</returns>
        protected TreeNode CreateTreeNodeWithoutMenu(string id, string parentId, FormCollection qs, string title, string icon, bool hasChildren = false)
        {
            var node = CreateTreeNode(id, parentId, qs, title, icon, hasChildren);
            node.MenuUrl = null;
            return node;
        }

        private TreeNode AddDateRangeNode(string id, FormCollection qs, string label, DateTime from, DateTime to)
        {
            string dateRange = string.Format("date:{0:yyyy-MM-dd}:{1:yyyy-MM-dd}", from, to);
            var node = CreateTreeNode(dateRange, id, qs, label, "icon-calendar");
            node.MenuUrl = null; // remove right-click
            return node;
        }
    }
}
