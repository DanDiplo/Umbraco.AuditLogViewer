using Diplo.AuditLogViewer.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Tree Controller that generates the content audit log tree within the Umbraco Settings section
    /// </summary>
    [Tree(Constants.Applications.Settings, treeAlias: AuditSettings.ContentLogAlias, TreeTitle = "Content Audit Logs", TreeGroup = Constants.Trees.Groups.ThirdParty, SortOrder = 10)]
    [PluginController(AuditSettings.PluginAreaName)]
    public class ContentLogTreeController : BaseTreeController
    {
        private readonly IContentLogService contentLogService;

        public ContentLogTreeController(ILocalizedTextService localizedTextService, UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection, IEventAggregator eventAggregator, IMenuItemCollectionFactory menuItemCollectionFactory, IContentLogService contentLogService)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator, menuItemCollectionFactory)
        {
            this.contentLogService = contentLogService ?? throw new ArgumentNullException(nameof(contentLogService));
        }

        /// <summary>
        /// Enables the root node to have it's own view
        /// </summary>
        protected override ActionResult<TreeNode> CreateRootNode(FormCollection qs)
        {
            var rootResult = base.CreateRootNode(qs);

            if (rootResult.Result is not null)
            {
                return rootResult;
            }

            var root = rootResult.Value;
            root.RoutePath = string.Format("{0}/{1}/{2}", Constants.Applications.Settings, AuditSettings.ContentLogAlias, "edit/ContentLog");
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
        protected override ActionResult<TreeNodeCollection> GetTreeNodes(string id, FormCollection qs)
        {
            var tree = new TreeNodeCollection();

            if (id == Constants.System.RootString)
            {
                tree.Add(CreateTreeNodeWithoutMenu("ContentLog", id, qs, "Search Content Logs", "icon-search"));
                tree.Add(CreateTreeNodeWithoutMenu("TimePeriod", id, qs, "Time Period", "icon-folder", true));
                tree.Add(CreateTreeNodeWithoutMenu("LatestPages", id, qs, "Latest Pages", "icon-folder", true));
            }
            else if (id == "TimePeriod")
            {
                this.AddDateRangeTree(tree, id, qs);
            }
            else if (id == "LatestPages")
            {
                this.AddLatestPagesTree(tree, id, qs);
            }

            return tree;
        }

        private void AddLatestPagesTree(TreeNodeCollection tree, string id, FormCollection qs)
        {
            var latest = this.contentLogService.GetLastUpdatedPages(10);

            foreach (var item in latest)
            {
                tree.Add(CreateTreeNodeWithoutMenu("node:" + item.NodeId, id, qs, item.Title, item.Icon));
            }
        }
    }
}
