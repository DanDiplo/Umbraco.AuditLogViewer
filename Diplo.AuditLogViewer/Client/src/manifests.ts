import type { ManifestBase } from "@umbraco-cms/backoffice/extension-api";
import {
    AUDIT_LOG_VIEWER_ENTITY_TYPE_PREFIX,
    AUDIT_LOG_VIEWER_MENU_ALIAS,
    AUDIT_LOG_VIEWER_ROOT_MENU_ITEM_ALIAS,
    AUDIT_LOG_VIEWER_SECTION_SIDEBAR_APP_ALIAS
} from "./constants";

type AuditLogViewerManifest = ManifestBase & Record<string, unknown>;

const UMB_SETTINGS_SECTION_ALIAS = "Umb.Section.Settings";
const UMB_SECTION_ALIAS_CONDITION_ALIAS = "Umb.Condition.SectionAlias";
const UMB_WORKSPACE_CONDITION_ALIAS = "Umb.Condition.WorkspaceAlias";

const pages = [
    {
        id: "content-log",
        label: "Content Log",
        icon: "icon-server-alt",
        weight: 200,
        element: () => import("./pages/content-log.element")
    },
    {
        id: "audit-trail",
        label: "Audit Trail",
        icon: "icon-server",
        weight: 100,
        element: () => import("./pages/audit-trail.element")
    }
] as const;

const pageManifests: AuditLogViewerManifest[] = pages.flatMap((page) => {
    const entityType = `${AUDIT_LOG_VIEWER_ENTITY_TYPE_PREFIX}-${page.id}`;
    const workspaceAlias = `Diplo.Workspace.AuditLogViewer.${page.id}`;

    return [
        {
            type: "workspace",
            alias: workspaceAlias,
            name: `Audit Log Viewer ${page.label} Workspace`,
            element: page.element,
            meta: { entityType }
        },
        {
            type: "workspaceView",
            alias: `${workspaceAlias}.Overview`,
            name: `Audit Log Viewer ${page.label}`,
            element: page.element,
            weight: page.weight,
            meta: {
                label: page.label,
                pathname: page.id,
                icon: page.icon
            },
            conditions: [
                {
                    alias: UMB_WORKSPACE_CONDITION_ALIAS,
                    match: workspaceAlias
                }
            ]
        }
    ];
});

export const allManifests: AuditLogViewerManifest[] = [
    {
        type: "menu",
        alias: AUDIT_LOG_VIEWER_MENU_ALIAS,
        name: "Audit Log Viewer Menu"
    },
    {
        type: "sectionSidebarApp",
        kind: "menu",
        alias: AUDIT_LOG_VIEWER_SECTION_SIDEBAR_APP_ALIAS,
        name: "Audit Log Viewer Sidebar Menu",
        weight: 45,
        meta: {
            label: "Audit Log Viewer",
            menu: AUDIT_LOG_VIEWER_MENU_ALIAS
        },
        conditions: [
            {
                alias: UMB_SECTION_ALIAS_CONDITION_ALIAS,
                match: UMB_SETTINGS_SECTION_ALIAS
            }
        ]
    },
    {
        type: "menuItem",
        alias: AUDIT_LOG_VIEWER_ROOT_MENU_ITEM_ALIAS,
        name: "Audit Log Viewer Menu Item",
        weight: 900,
        element: () => import("./menu/audit-log-viewer-menu-item.element"),
        meta: {
            label: "Audit Log Viewer",
            icon: "icon-search",
            menus: [AUDIT_LOG_VIEWER_MENU_ALIAS]
        }
    },
    ...pageManifests
];
