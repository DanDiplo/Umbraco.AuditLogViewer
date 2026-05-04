import { LitElement, css, customElement, html, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_SECTION_CONTEXT } from "@umbraco-cms/backoffice/section";
import { AUDIT_LOG_VIEWER_ENTITY_TYPE_PREFIX } from "../constants";

const CHILDREN = [
    { id: "content-log", label: "Content Log", icon: "icon-server-alt" },
    { id: "audit-trail", label: "Audit Trail", icon: "icon-server" }
] as const;

@customElement("diplo-audit-log-viewer-menu-item")
export class AuditLogViewerMenuItemElement extends UmbElementMixin(LitElement) {
    @property({ type: Object, attribute: false }) manifest: { meta: { label?: string; icon?: string }; name: string } | null = null;
    @state() private _pathname?: string;
    @state() private _open = true;

    constructor() {
        super();
        this.consumeContext(UMB_SECTION_CONTEXT, (ctx) => {
            this.observe(
                ctx?.pathname,
                (pathname: string | undefined) => {
                    this._pathname = pathname;
                },
                "observePathname"
            );
        });
    }

    private _hrefFor(id: string): string | undefined {
        if (!this._pathname) return undefined;
        return `section/${this._pathname}/workspace/${AUDIT_LOG_VIEWER_ENTITY_TYPE_PREFIX}-${id}`;
    }

    override render() {
        if (!this.manifest) return html``;

        return html`
            <umb-menu-item-layout
                .href=${this._hrefFor("content-log")}
                .iconName=${this.manifest.meta.icon ?? "icon-search"}
                .label=${this.manifest.meta.label ?? this.manifest.name}
                ?has-children=${true}
                @click=${() => (this._open = !this._open)}
            ></umb-menu-item-layout>
            ${this._open
                ? html`<div class="children">
                      ${CHILDREN.map(
                          (child) => html`
                              <umb-menu-item-layout
                                  .href=${this._hrefFor(child.id)}
                                  .iconName=${child.icon}
                                  .label=${child.label}
                              ></umb-menu-item-layout>
                          `
                      )}
                  </div>`
                : ""}
        `;
    }

    static override styles = css`
        :host {
            display: contents;
        }

        .children {
            display: block;
            padding-left: var(--uui-size-space-4);
        }
    `;
}

export default AuditLogViewerMenuItemElement;

declare global {
    interface HTMLElementTagNameMap {
        "diplo-audit-log-viewer-menu-item": AuditLogViewerMenuItemElement;
    }
}
