using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Trees;
using Umbraco.Cms.Web.BackOffice.Trees;
using Umbraco.Cms.Web.Common.Attributes;

namespace Diplo.AuditLogViewer.Controllers
{
    /// <summary>
    /// Tree Controller that generates the audit log tree within the Umbraco Settings section
    /// </summary>
    [Tree(Constants.Applications.Settings, treeAlias: AuditSettings.AuditTrailAlias, TreeTitle = "Audit Trail Logs", TreeGroup = Constants.Trees.Groups.ThirdParty, SortOrder = 11)]
    [PluginController(AuditSettings.PluginAreaName)]
    public class AuditTrailTreeController : BaseTreeController
    {
        public AuditTrailTreeController(ILocalizedTextService localizedTextService, UmbracoApiControllerTypeCollection umbracoApiControllerTypeCollection, IEventAggregator eventAggregator, IMenuItemCollectionFactory menuItemCollectionFactory)
            : base(localizedTextService, umbracoApiControllerTypeCollection, eventAggregator, menuItemCollectionFactory)
        {
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
            root.RoutePath = string.Format("{0}/{1}/{2}", Constants.Applications.Settings, AuditSettings.AuditTrailAlias, "edit/AuditTrail");
            root.Icon = "icon-server";
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
                tree.Add(CreateTreeNodeWithoutMenu("AuditTrail", id, qs, "Search Audit Trail", "icon-search", false));
                tree.Add(CreateTreeNodeWithoutMenu("TimePeriod", id, qs, "Time Period", "icon-folder", true));
            }
            else if (id == "TimePeriod")
            {
                this.AddDateRangeTree(tree, id, qs);
            }

            return tree;
        }
    }
}
