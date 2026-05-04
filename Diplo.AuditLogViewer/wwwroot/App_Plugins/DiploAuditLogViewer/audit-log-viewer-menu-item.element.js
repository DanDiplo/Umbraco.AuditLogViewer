import { LitElement as p, html as r, css as h, property as c, state as u, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
import { UMB_SECTION_CONTEXT as d } from "@umbraco-cms/backoffice/section";
import { a as b } from "./index2.js";
var v = Object.defineProperty, E = Object.getOwnPropertyDescriptor, s = (e, n, a, o) => {
  for (var t = o > 1 ? void 0 : o ? E(n, a) : n, m = e.length - 1, l; m >= 0; m--)
    (l = e[m]) && (t = (o ? l(n, a, t) : l(t)) || t);
  return o && t && v(n, a, t), t;
};
const $ = [
  { id: "content-log", label: "Content Log", icon: "icon-server-alt" },
  { id: "audit-trail", label: "Audit Trail", icon: "icon-server" }
];
let i = class extends _(p) {
  constructor() {
    super(), this.manifest = null, this._open = !0, this.consumeContext(d, (e) => {
      this.observe(
        e == null ? void 0 : e.pathname,
        (n) => {
          this._pathname = n;
        },
        "observePathname"
      );
    });
  }
  _hrefFor(e) {
    if (this._pathname)
      return `section/${this._pathname}/workspace/${b}-${e}`;
  }
  render() {
    return this.manifest ? r`
            <umb-menu-item-layout
                .href=${this._hrefFor("content-log")}
                .iconName=${this.manifest.meta.icon ?? "icon-search"}
                .label=${this.manifest.meta.label ?? this.manifest.name}
                ?has-children=${!0}
                @click=${() => this._open = !this._open}
            ></umb-menu-item-layout>
            ${this._open ? r`<div class="children">
                      ${$.map(
      (e) => r`
                              <umb-menu-item-layout
                                  .href=${this._hrefFor(e.id)}
                                  .iconName=${e.icon}
                                  .label=${e.label}
                              ></umb-menu-item-layout>
                          `
    )}
                  </div>` : ""}
        ` : r``;
  }
};
i.styles = h`
        :host {
            display: contents;
        }

        .children {
            display: block;
            padding-left: var(--uui-size-space-4);
        }
    `;
s([
  c({ type: Object, attribute: !1 })
], i.prototype, "manifest", 2);
s([
  u()
], i.prototype, "_pathname", 2);
s([
  u()
], i.prototype, "_open", 2);
i = s([
  f("diplo-audit-log-viewer-menu-item")
], i);
const g = i;
export {
  i as AuditLogViewerMenuItemElement,
  g as default
};
//# sourceMappingURL=audit-log-viewer-menu-item.element.js.map
