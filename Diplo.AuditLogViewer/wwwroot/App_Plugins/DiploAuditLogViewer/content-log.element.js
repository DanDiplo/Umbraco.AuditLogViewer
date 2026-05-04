import { LitElement as y, html as a, css as b, state as r, customElement as v } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as T } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as f } from "@umbraco-cms/backoffice/notification";
import { a as d, D as c, d as $, f as h, m as x, r as P } from "./filters.js";
import { UMB_EDIT_DATA_TYPE_WORKSPACE_PATH_PATTERN as E } from "@umbraco-cms/backoffice/data-type";
import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as N, UMB_DOCUMENT_ENTITY_TYPE as S } from "@umbraco-cms/backoffice/document";
import { UMB_EDIT_DOCUMENT_TYPE_WORKSPACE_PATH_PATTERN as C, UMB_DOCUMENT_TYPE_ENTITY_TYPE as w } from "@umbraco-cms/backoffice/document-type";
import { UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN as I, UMB_MEDIA_ENTITY_TYPE as D } from "@umbraco-cms/backoffice/media";
import { UMB_EDIT_MEMBER_WORKSPACE_PATH_PATTERN as A, UMB_MEMBER_ENTITY_TYPE as k } from "@umbraco-cms/backoffice/member";
import { UmbModalRouteRegistrationController as R } from "@umbraco-cms/backoffice/router";
import { UMB_TEMPLATE_ENTITY_TYPE as L } from "@umbraco-cms/backoffice/template";
import { UMB_WORKSPACE_MODAL as F, UMB_WORKSPACE_EDIT_PATH_PATTERN as M } from "@umbraco-cms/backoffice/workspace";
function O(e) {
  return _(e) !== void 0;
}
function U(e, t, i, n) {
  if (!t) return;
  const l = _(i);
  if (!l) return;
  n == null || n.preventDefault(), n == null || n.stopPropagation();
  const u = z(l);
  new R(e, F).addAdditionalPath(u).onSetup(() => ({
    data: {
      entityType: u,
      preset: {}
    }
  })).onSubmit(() => {
  }).onReject(() => {
  }).observeRouteBuilder((p) => {
    const g = p({}), m = B(l, t);
    history.pushState(null, "", `${g}/${m}`), window.dispatchEvent(new PopStateEvent("popstate"));
  });
}
function _(e) {
  switch ((e ?? "").toLowerCase()) {
    case "document":
      return "content";
    case "documenttype":
      return "documentType";
    case "media":
      return "media";
    case "member":
      return "member";
    case "template":
      return "template";
    case "datatype":
      return "dataType";
    case "partial-view":
      return "partial";
    default:
      return;
  }
}
function z(e) {
  switch (e) {
    case "content":
      return S;
    case "documentType":
      return w;
    case "media":
      return D;
    case "member":
      return k;
    case "template":
      return L;
    case "dataType":
      return "data-type";
    case "partial":
      return "partial-view";
  }
}
function B(e, t) {
  switch (e) {
    case "content":
      return N.generateLocal({ unique: t });
    case "documentType":
      return C.generateLocal({ unique: t });
    case "dataType":
      return E.generateLocal({ unique: t });
    case "media":
      return `${I.generateLocal({ unique: t })}/invariant`;
    case "member":
      return A.generateLocal({ unique: t });
    case "template":
    case "partial":
      return M.generateLocal({ unique: t });
  }
}
var Y = Object.defineProperty, H = Object.getOwnPropertyDescriptor, o = (e, t, i, n) => {
  for (var l = n > 1 ? void 0 : n ? H(t, i) : t, u = e.length - 1, p; u >= 0; u--)
    (p = e[u]) && (l = (n ? p(t, i, l) : p(l)) || l);
  return n && l && Y(t, i, l), l;
};
const Q = [10, 20, 50, 100, 200, 500], K = [
  { key: "L.Datestamp", label: "Date" },
  { key: "U.userName", label: "User" },
  { key: "L.logHeader", label: "Action" },
  { key: "L.nodeId", label: "Node" },
  { key: "N.text", label: "Content" },
  { key: "N.nodeObjectType", label: "Type" }
];
let s = class extends T(y) {
  constructor() {
    super(), this._page = null, this._logTypes = [], this._entityTypes = [], this._users = [], this._loading = !1, this._expanded = /* @__PURE__ */ new Set(), this._currentPage = 1, this._itemsPerPage = 50, this._sortColumn = "L.Datestamp", this._sortOrder = "desc", this._logType = "", this._entityType = "", this._userName = "", this._searchTerm = "", this._nodeId = "", this._nodeQuery = "", this._nodeLabel = "", this._nodeSuggestions = [], this._showNodeSuggestions = !1, this._dateFrom = "", this._dateTo = "", this._datePreset = "", this._exporting = !1, this._disableExport = !1, this.consumeContext(f, (e) => {
      this._notifications = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSettings(), this._loadFilters(), this._fetch();
  }
  async _loadSettings() {
    try {
      const e = await d("settings");
      this._disableExport = e.disableExport;
    } catch {
      this._notifyError("Could not load Audit Log Viewer settings.");
    }
  }
  async _loadFilters() {
    try {
      const [e, t, i] = await Promise.all([
        d("content-log/types"),
        d("content-log/users"),
        d("content-log/entity-types")
      ]);
      this._logTypes = e, this._users = t, this._entityTypes = i;
    } catch {
      this._notifyError("Could not load content log filters.");
    }
  }
  async _fetch() {
    this._loading = !0;
    try {
      this._page = await d("content-log", this._buildParams(this._currentPage, this._itemsPerPage)), this._currentPage = this._page.currentPage;
    } catch {
      this._notifyError("Could not load content log data.");
    } finally {
      this._loading = !1;
    }
  }
  _notifyError(e) {
    var t;
    (t = this._notifications) == null || t.peek("danger", { data: { headline: "Audit Log Viewer", message: e } });
  }
  _filterChange(e) {
    e(), this._currentPage = 1, this._fetch();
  }
  _setTextFilter(e, t) {
    this._filterChange(() => t(e.target.value));
  }
  _setNodeQuery(e) {
    const t = e.target.value;
    if (this._nodeQuery = t, this._nodeLabel = "", this._nodeSearchTimer && window.clearTimeout(this._nodeSearchTimer), !t.trim()) {
      this._filterChange(() => {
        this._nodeId = "", this._nodeSuggestions = [], this._showNodeSuggestions = !1;
      });
      return;
    }
    if (/^\d+$/.test(t.trim())) {
      this._nodeSearchTimer = window.setTimeout(() => {
        this._filterChange(() => this._nodeId = t.trim()), this._loadNodeSuggestions(t.trim());
      }, 300);
      return;
    }
    this._nodeSearchTimer = window.setTimeout(() => void this._loadNodeSuggestions(t), 300);
  }
  async _loadNodeSuggestions(e) {
    try {
      this._nodeSuggestions = await d("content-log/nodes", { term: e, take: 10 }), this._showNodeSuggestions = this._nodeSuggestions.length > 0;
    } catch {
      this._nodeSuggestions = [], this._showNodeSuggestions = !1;
    }
  }
  _selectNodeSuggestion(e) {
    const t = this._nodeDisplayName(e);
    this._filterChange(() => {
      this._nodeId = String(e.nodeId), this._nodeLabel = t, this._nodeQuery = t, this._nodeSuggestions = [], this._showNodeSuggestions = !1;
    });
  }
  _nodeDisplayName(e) {
    return `${e.name || `Node #${e.nodeId}`} (#${e.nodeId})`;
  }
  _iconName(e) {
    return (e == null ? void 0 : e.split(/\s+/)[0]) ?? "";
  }
  _hideNodeSuggestionsSoon() {
    window.setTimeout(() => {
      this._showNodeSuggestions = !1;
    }, 150);
  }
  _buildParams(e, t) {
    return {
      logType: this._logType,
      entityType: this._entityType,
      userName: this._userName,
      searchTerm: this._searchTerm,
      nodeId: this._nodeId,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
      itemsPerPage: t,
      pageNumber: e,
      sortColumn: this._sortColumn,
      sortOrder: this._sortOrder
    };
  }
  _sort(e) {
    this._sortColumn === e ? this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc" : (this._sortColumn = e, this._sortOrder = "asc"), this._currentPage = 1, this._fetch();
  }
  _setPage(e) {
    !this._page || e < 1 || e > this._page.totalPages || e === this._currentPage || (this._currentPage = e, this._fetch());
  }
  _reset() {
    this._logType = "", this._entityType = "", this._userName = "", this._searchTerm = "", this._nodeId = "", this._nodeQuery = "", this._nodeLabel = "", this._nodeSuggestions = [], this._showNodeSuggestions = !1, this._dateFrom = "", this._dateTo = "", this._datePreset = "", this._currentPage = 1, this._fetch();
  }
  _applyDatePreset(e) {
    const t = e.target.value, i = c.find((n) => n.key === t);
    this._filterChange(() => {
      if (this._datePreset = t, i) {
        const n = i.getRange();
        this._dateFrom = n.dateFrom, this._dateTo = n.dateTo;
      }
    });
  }
  _setDate(e, t) {
    this._filterChange(() => {
      this._datePreset = "", t(e.target.value);
    });
  }
  _toggleDetails(e) {
    const t = new Set(this._expanded);
    t.has(e) ? t.delete(e) : t.add(e), this._expanded = t;
  }
  async _getRowsForExport(e) {
    var i, n;
    if (e === "page") return ((i = this._page) == null ? void 0 : i.logEntries) ?? [];
    const t = ((n = this._page) == null ? void 0 : n.totalItems) ?? 0;
    if (t === 0) return [];
    this._exporting = !0;
    try {
      return (await d("content-log", this._buildParams(1, t))).logEntries;
    } finally {
      this._exporting = !1;
    }
  }
  _downloadRows(e, t) {
    $(x("content_log", this._dateFrom, this._dateTo, t), [
      ["Date", "User", "Action", "Node", "Content", "Type", "Entity Type", "Parameters"],
      ...e.map((i) => [h(i.dateStamp), i.userName, i.logHeader, i.nodeId, i.text, i.typeDesc, i.entityType, i.parameters])
    ]);
  }
  _exportPageCsv() {
    var e;
    this._downloadRows(((e = this._page) == null ? void 0 : e.logEntries) ?? [], "page");
  }
  async _exportAllCsv() {
    try {
      this._downloadRows(await this._getRowsForExport("all"), "all");
    } catch {
      this._notifyError("Could not export content log data.");
    }
  }
  _activeFilterChips() {
    const e = [], t = c.find((i) => i.key === this._datePreset);
    return this._logType && e.push({ label: `Type: ${this._logType}`, onRemove: () => this._filterChange(() => this._logType = "") }), this._entityType && e.push({ label: `Entity: ${this._entityType}`, onRemove: () => this._filterChange(() => this._entityType = "") }), this._userName && e.push({ label: `User: ${this._userName}`, onRemove: () => this._filterChange(() => this._userName = "") }), this._searchTerm && e.push({ label: `Search: ${this._searchTerm}`, onRemove: () => this._filterChange(() => this._searchTerm = "") }), this._nodeId && e.push({
      label: `Node: ${this._nodeLabel || this._nodeId}`,
      onRemove: () => this._filterChange(() => {
        this._nodeId = "", this._nodeQuery = "", this._nodeLabel = "", this._nodeSuggestions = [], this._showNodeSuggestions = !1;
      })
    }), (this._dateFrom || this._dateTo) && e.push({
      label: t ? t.label : `Date: ${this._dateFrom || "start"} to ${this._dateTo || "today"}`,
      onRemove: () => this._filterChange(() => {
        this._dateFrom = "", this._dateTo = "", this._datePreset = "";
      })
    }), e;
  }
  _renderSortHeader(e) {
    const t = this._sortColumn === e.key;
    return a`
            <button class="sort-button" type="button" @click=${() => this._sort(e.key)}>
                ${e.label}
                ${t ? a`<uui-icon name=${this._sortOrder === "asc" ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>` : ""}
            </button>
        `;
  }
  _renderPager() {
    if (!this._page || this._page.totalItems === 0) return "";
    const e = this._page.itemsPerPage * (this._page.currentPage - 1) + 1, t = e + this._page.logEntries.length - 1;
    return a`
            <div class="pager">
                <span>Entries ${e}-${t} of ${this._page.totalItems}</span>
                <label>
                    <select @change=${(i) => this._filterChange(() => this._itemsPerPage = Number(i.target.value))}>
                        ${Q.map((i) => a`<option value=${i} ?selected=${this._itemsPerPage === i}>${i}</option>`)}
                    </select>
                    per page
                </label>
                <div class="pager-buttons">
                    <uui-button compact label="Previous" ?disabled=${this._page.currentPage <= 1} @click=${() => this._setPage(this._currentPage - 1)}></uui-button>
                    <span>Page ${this._page.currentPage} of ${this._page.totalPages}</span>
                    <uui-button compact label="Next" ?disabled=${this._page.currentPage >= this._page.totalPages} @click=${() => this._setPage(this._currentPage + 1)}></uui-button>
                </div>
            </div>
        `;
  }
  render() {
    var t;
    const e = ((t = this._page) == null ? void 0 : t.logEntries) ?? [];
    return a`
            <umb-body-layout header-fit-height>
                <div class="page" slot="header">
                    <uui-box headline="Content Log Viewer">
                        ${this._disableExport ? "" : a`
                                  <div slot="header-actions">
                                      <uui-button label="Export Page" ?disabled=${e.length === 0 || this._exporting} @click=${this._exportPageCsv}></uui-button>
                                      <uui-button look="primary" label="Export All" ?disabled=${e.length === 0 || this._exporting} @click=${() => void this._exportAllCsv()}></uui-button>
                                  </div>
                              `}
                        ${this._renderFilters()}
                        ${P(this._activeFilterChips(), () => this._reset())}
                    </uui-box>
                </div>
                <div class="page results">
                    ${this._loading ? a`<uui-loader></uui-loader>` : this._renderTable(e)}
                    ${this._renderPager()}
                </div>
            </umb-body-layout>
        `;
  }
  _renderFilters() {
    return a`
            <div class="filters">
                <label>
                    Log Type
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._logType = t)}>
                        <option value="">Any</option>
                        ${this._logTypes.map((e) => a`<option value=${e} ?selected=${this._logType === e}>${e}</option>`)}
                    </select>
                </label>
                <label>
                    Entity Type
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._entityType = t)}>
                        <option value="">Any</option>
                        ${this._entityTypes.map((e) => a`<option value=${e} ?selected=${this._entityType === e}>${e}</option>`)}
                    </select>
                </label>
                <label>
                    User
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._userName = t)}>
                        <option value="">Any</option>
                        ${this._users.map((e) => a`<option value=${e} ?selected=${this._userName === e}>${e}</option>`)}
                    </select>
                </label>
                <label>
                    Search
                    <uui-input
                        type="search"
                        autocomplete="off"
                        name="diplo-audit-log-viewer-content-search"
                        placeholder="Search logs"
                        .value=${this._searchTerm}
                        @change=${(e) => this._setTextFilter(e, (t) => this._searchTerm = t)}></uui-input>
                </label>
                <label>
                    Node
                    <div class="node-search">
                        <uui-input
                            type="search"
                            autocomplete="off"
                            name="diplo-audit-log-viewer-node"
                            placeholder="Search name or enter id"
                            .value=${this._nodeQuery || this._nodeId}
                            @input=${this._setNodeQuery}
                            @focus=${() => this._showNodeSuggestions = this._nodeSuggestions.length > 0}
                            @blur=${this._hideNodeSuggestionsSoon}></uui-input>
                        ${this._showNodeSuggestions ? a`
                                  <div class="node-suggestions">
                                      ${this._nodeSuggestions.map(
      (e) => a`
                                              <button type="button" @click=${() => this._selectNodeSuggestion(e)}>
                                                  <span>${e.name || `Node #${e.nodeId}`}</span>
                                                  <small>#${e.nodeId} ${e.entityType ? a`&middot; ${e.entityType}` : ""} ${e.nodeExists ? "" : a`&middot; missing`}</small>
                                              </button>
                                          `
    )}
                                  </div>
                              ` : ""}
                    </div>
                </label>
                <label>
                    Period
                    <select @change=${this._applyDatePreset}>
                        <option value="" ?selected=${this._datePreset === ""}>Custom</option>
                        ${c.map((e) => a`<option value=${e.key} ?selected=${this._datePreset === e.key}>${e.label}</option>`)}
                    </select>
                </label>
                <label>
                    From
                    <input type="date" .value=${this._dateFrom} @change=${(e) => this._setDate(e, (t) => this._dateFrom = t)} />
                </label>
                <label>
                    To
                    <input type="date" .value=${this._dateTo} @change=${(e) => this._setDate(e, (t) => this._dateTo = t)} />
                </label>
            </div>
        `;
  }
  _renderTable(e) {
    return e.length ? a`
            <div class="log-table content-table">
                <div class="table-head">
                    ${K.map((t) => a`<div class="table-cell head-cell">${this._renderSortHeader(t)}</div>`)}
                </div>
                ${e.map((t) => this._renderRow(t))}
            </div>
        ` : a`<div class="empty">No log records found for your selected criteria.</div>`;
  }
  _renderRow(e) {
    const t = !!(e.logComment || e.parameters || e.entityType || e.alias || e.typeDesc || e.uniqueId || e.nodeId), i = this._expanded.has(e.id);
    return a`
            <div class="table-row clickable" @click=${() => this._toggleDetails(e.id)}>
                <div class="table-cell">${h(e.dateStamp)}</div>
                <div class="table-cell">${e.userName}</div>
                <div class="table-cell">${e.logHeader}${t ? a` <uui-icon name="icon-eye"></uui-icon>` : ""}</div>
                <div class="table-cell">
                    ${e.nodeId > 0 && e.uniqueId && O(e.entityType) ? a`<a href="" @click=${(n) => U(this, e.uniqueId, e.entityType, n)}>${e.nodeId}</a>` : e.nodeId > 0 ? e.nodeId : ""}
                    ${e.nodeId > 0 ? a`<uui-tag color=${e.nodeExists ? "positive" : "warning"}>${e.nodeExists ? "Exists" : "Missing"}</uui-tag>` : ""}
                </div>
                <div class="table-cell content-cell">${e.icon ? a`<uui-icon name=${this._iconName(e.icon)} title=${e.alias ?? ""}></uui-icon>` : ""}<span>${e.text}</span></div>
                <div class="table-cell">${e.typeDesc}</div>
            </div>
            ${i ? a`
                      <div class="detail-panel">
                          <dl class="details">
                              <div class="wide"><dt>Comment</dt><dd>${e.logComment || "No comment recorded."}</dd></div>
                              <div class="wide"><dt>Parameters</dt><dd>${e.parameters || "No parameters recorded."}</dd></div>
                              <div><dt>Entity type</dt><dd>${e.entityType || "Unavailable"}</dd></div>
                              <div><dt>Node key</dt><dd><code>${e.uniqueId || "Unavailable"}</code></dd></div>
                              <div><dt>Document type</dt><dd>${e.alias || e.typeDesc || "Unavailable"}</dd></div>
                              <div><dt>Status</dt><dd>${e.nodeExists ? "Node exists" : "Node no longer exists or cannot be resolved"}</dd></div>
                          </dl>
                      </div>
                  ` : ""}
        `;
  }
};
s.styles = b`
        :host {
            display: contents;
        }
        .page {
            display: block;
            box-sizing: border-box;
            width: 100%;
            padding: var(--uui-size-layout-1);
        }
        uui-box {
            display: block;
            box-sizing: border-box;
            width: 100%;
        }
        .results {
            padding-top: 0;
        }
        .filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--uui-size-space-4);
            align-items: end;
            margin-bottom: var(--uui-size-space-5);
        }
        label {
            display: grid;
            gap: var(--uui-size-space-1);
            font-weight: 600;
            min-width: 0;
        }
        select,
        input {
            width: 100%;
            box-sizing: border-box;
            min-height: 32px;
            border: 1px solid var(--uui-color-border);
            border-radius: var(--uui-border-radius);
            background: var(--uui-color-surface);
            color: var(--uui-color-text);
        }
        uui-input {
            width: 100%;
        }
        .node-search {
            position: relative;
            min-width: 0;
            display: grid;
        }
        .node-suggestions {
            position: absolute;
            z-index: 10;
            top: calc(100% + 2px);
            right: 0;
            left: 0;
            max-height: 260px;
            overflow: auto;
            border: 1px solid var(--uui-color-border);
            border-radius: var(--uui-border-radius);
            background: var(--uui-color-surface);
            box-shadow: var(--uui-shadow-depth-3);
        }
        .node-suggestions button {
            display: grid;
            width: 100%;
            gap: var(--uui-size-space-1);
            border: 0;
            border-bottom: 1px solid var(--uui-color-border);
            padding: var(--uui-size-space-3);
            color: var(--uui-color-text);
            background: transparent;
            text-align: left;
            cursor: pointer;
        }
        .node-suggestions button:hover,
        .node-suggestions button:focus {
            background: var(--uui-color-surface-alt);
        }
        .node-suggestions small {
            color: var(--uui-color-text-alt);
        }
        .sort-button {
            display: inline-flex;
            align-items: center;
            gap: var(--uui-size-space-1);
            border: 0;
            padding: 0;
            color: var(--uui-color-interactive);
            background: transparent;
            cursor: pointer;
            font: inherit;
            font-weight: 700;
        }
        .clickable {
            cursor: pointer;
        }
        .filter-chips {
            display: flex;
            flex-wrap: wrap;
            gap: var(--uui-size-space-2);
            margin-bottom: var(--uui-size-space-4);
        }
        .log-table {
            display: grid;
            border-top: 1px solid var(--uui-color-border);
        }
        .content-table {
            grid-template-columns:
                minmax(160px, 0.8fr)
                minmax(180px, 1fr)
                minmax(140px, 0.8fr)
                minmax(120px, 0.7fr)
                minmax(220px, 1.4fr)
                minmax(140px, 0.8fr);
        }
        .table-head,
        .table-row {
            display: grid;
            grid-column: 1 / -1;
            grid-template-columns: subgrid;
            border-bottom: 1px solid var(--uui-color-border);
            background: var(--uui-color-surface);
        }
        .table-head {
            background: var(--uui-color-surface);
        }
        .table-cell {
            min-width: 0;
            padding: var(--uui-size-space-3);
            overflow-wrap: anywhere;
        }
        .head-cell {
            font-weight: 700;
        }
        .content-cell {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-2);
        }
        .content-cell span {
            min-width: 0;
            overflow-wrap: anywhere;
        }
        .detail-panel {
            grid-column: 1 / -1;
            border-top: 1px solid var(--uui-color-border);
            border-bottom: 1px solid var(--uui-color-border);
            background: var(--uui-color-surface-alt);
        }
        .details {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: var(--uui-size-space-4);
            margin: 0;
            padding: var(--uui-size-space-4);
        }
        .details div {
            min-width: 0;
        }
        .details .wide {
            grid-column: 1 / -1;
        }
        dt {
            font-weight: 700;
            color: var(--uui-color-text-alt);
        }
        dd {
            margin: var(--uui-size-space-1) 0 0;
            overflow-wrap: anywhere;
            white-space: pre-wrap;
        }
        uui-tag {
            margin-left: var(--uui-size-space-2);
        }
        .empty {
            padding: var(--uui-size-layout-1);
            text-align: center;
            color: var(--uui-color-text-alt);
        }
        .pager {
            display: flex;
            flex-wrap: wrap;
            gap: var(--uui-size-space-4);
            align-items: center;
            justify-content: space-between;
            margin-top: var(--uui-size-space-4);
        }
        .pager-buttons {
            display: flex;
            align-items: center;
            gap: var(--uui-size-space-3);
        }
        a {
            color: var(--uui-color-interactive);
        }
        @media (max-width: 1200px) {
            .filters {
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            }
        }
        @media (max-width: 700px) {
            .filters {
                grid-template-columns: 1fr;
            }
        }
    `;
o([
  r()
], s.prototype, "_page", 2);
o([
  r()
], s.prototype, "_logTypes", 2);
o([
  r()
], s.prototype, "_entityTypes", 2);
o([
  r()
], s.prototype, "_users", 2);
o([
  r()
], s.prototype, "_loading", 2);
o([
  r()
], s.prototype, "_expanded", 2);
o([
  r()
], s.prototype, "_currentPage", 2);
o([
  r()
], s.prototype, "_itemsPerPage", 2);
o([
  r()
], s.prototype, "_sortColumn", 2);
o([
  r()
], s.prototype, "_sortOrder", 2);
o([
  r()
], s.prototype, "_logType", 2);
o([
  r()
], s.prototype, "_entityType", 2);
o([
  r()
], s.prototype, "_userName", 2);
o([
  r()
], s.prototype, "_searchTerm", 2);
o([
  r()
], s.prototype, "_nodeId", 2);
o([
  r()
], s.prototype, "_nodeQuery", 2);
o([
  r()
], s.prototype, "_nodeLabel", 2);
o([
  r()
], s.prototype, "_nodeSuggestions", 2);
o([
  r()
], s.prototype, "_showNodeSuggestions", 2);
o([
  r()
], s.prototype, "_dateFrom", 2);
o([
  r()
], s.prototype, "_dateTo", 2);
o([
  r()
], s.prototype, "_datePreset", 2);
o([
  r()
], s.prototype, "_exporting", 2);
o([
  r()
], s.prototype, "_disableExport", 2);
s = o([
  v("diplo-content-log-page")
], s);
const ae = s;
export {
  s as ContentLogPageElement,
  ae as default
};
//# sourceMappingURL=content-log.element.js.map
