const I = "/umbraco/management/api/v1/audit-log-viewer", n = "Diplo.Menu.AuditLogViewer", o = "Diplo.MenuItem.AuditLogViewer", a = "Diplo.SectionSidebarApp.AuditLogViewer", s = "diplo-audit-log-viewer", l = "Umb.Section.Settings", A = "Umb.Condition.SectionAlias", c = "Umb.Condition.WorkspaceAlias", r = [
  {
    id: "content-log",
    label: "Content Log",
    icon: "icon-server-alt",
    weight: 200,
    element: () => import("./content-log.element.js")
  },
  {
    id: "audit-trail",
    label: "Audit Trail",
    icon: "icon-server",
    weight: 100,
    element: () => import("./audit-trail.element.js")
  }
], m = r.flatMap((e) => {
  const i = `${s}-${e.id}`, t = `Diplo.Workspace.AuditLogViewer.${e.id}`;
  return [
    {
      type: "workspace",
      alias: t,
      name: `Audit Log Viewer ${e.label} Workspace`,
      element: e.element,
      meta: { entityType: i }
    },
    {
      type: "workspaceView",
      alias: `${t}.Overview`,
      name: `Audit Log Viewer ${e.label}`,
      element: e.element,
      weight: e.weight,
      meta: {
        label: e.label,
        pathname: e.id,
        icon: e.icon
      },
      conditions: [
        {
          alias: c,
          match: t
        }
      ]
    }
  ];
}), _ = [
  {
    type: "menu",
    alias: n,
    name: "Audit Log Viewer Menu"
  },
  {
    type: "sectionSidebarApp",
    kind: "menu",
    alias: a,
    name: "Audit Log Viewer Sidebar Menu",
    weight: 45,
    meta: {
      label: "Audit Log Viewer",
      menu: n
    },
    conditions: [
      {
        alias: A,
        match: l
      }
    ]
  },
  {
    type: "menuItem",
    alias: o,
    name: "Audit Log Viewer Menu Item",
    weight: 900,
    element: () => import("./audit-log-viewer-menu-item.element.js"),
    meta: {
      label: "Audit Log Viewer",
      icon: "icon-search",
      menus: [n]
    }
  },
  ...m
], d = (e, i) => {
  i.registerMany(_);
};
export {
  I as A,
  s as a,
  d as o
};
//# sourceMappingURL=index2.js.map
