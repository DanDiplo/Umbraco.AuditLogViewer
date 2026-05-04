import { LitElement as _, html as o, css as g, state as s, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as v } from "@umbraco-cms/backoffice/notification";
import { a as n, D as h, d as b, f as u, m as y, r as x } from "./filters.js";
var $ = Object.defineProperty, P = Object.getOwnPropertyDescriptor, r = (e, t, i, l) => {
  for (var d = l > 1 ? void 0 : l ? P(t, i) : t, p = e.length - 1, c; p >= 0; p--)
    (c = e[p]) && (d = (l ? c(t, i, d) : c(d)) || d);
  return l && d && $(t, i, d), d;
};
const T = [10, 20, 50, 100, 200, 500], I = [
  { key: "eventDateUtc", label: "Date" },
  { key: "performingDetails", label: "Performer" },
  { key: "performingIp", label: "IP" },
  { key: "affectedDetails", label: "Affected" },
  { key: "eventType", label: "Event" },
  { key: "eventDetails", label: "Details" }
];
let a = class extends m(_) {
  constructor() {
    super(), this._page = null, this._eventTypes = [], this._users = [], this._loading = !1, this._currentPage = 1, this._itemsPerPage = 50, this._sortColumn = "eventDateUtc", this._sortOrder = "desc", this._eventType = "", this._performingUserId = "", this._affectedUserId = "", this._performingIp = "", this._searchTerm = "", this._dateFrom = "", this._dateTo = "", this._datePreset = "", this._expanded = /* @__PURE__ */ new Set(), this._exporting = !1, this._disableExport = !1, this.consumeContext(v, (e) => {
      this._notifications = e;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._loadSettings(), this._loadFilters(), this._fetch();
  }
  async _loadSettings() {
    try {
      const e = await n("settings");
      this._disableExport = e.disableExport;
    } catch {
      this._notifyError("Could not load Audit Log Viewer settings.");
    }
  }
  async _loadFilters() {
    try {
      const [e, t] = await Promise.all([
        n("audit-trail/event-types"),
        n("audit-trail/users")
      ]);
      this._eventTypes = e, this._users = t;
    } catch {
      this._notifyError("Could not load audit trail filters.");
    }
  }
  async _fetch() {
    this._loading = !0;
    try {
      this._page = await n("audit-trail", this._buildParams(this._currentPage, this._itemsPerPage)), this._currentPage = this._page.currentPage;
    } catch {
      this._notifyError("Could not load audit trail data.");
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
  _buildParams(e, t) {
    return {
      eventType: this._eventType,
      performingUserId: this._performingUserId,
      affectedUserId: this._affectedUserId,
      performingIp: this._performingIp,
      searchTerm: this._searchTerm,
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
    this._eventType = "", this._performingUserId = "", this._affectedUserId = "", this._performingIp = "", this._searchTerm = "", this._dateFrom = "", this._dateTo = "", this._datePreset = "", this._currentPage = 1, this._fetch();
  }
  _applyDatePreset(e) {
    const t = e.target.value, i = h.find((l) => l.key === t);
    this._filterChange(() => {
      if (this._datePreset = t, i) {
        const l = i.getRange();
        this._dateFrom = l.dateFrom, this._dateTo = l.dateTo;
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
    var i, l;
    if (e === "page") return ((i = this._page) == null ? void 0 : i.logEntries) ?? [];
    const t = ((l = this._page) == null ? void 0 : l.totalItems) ?? 0;
    if (t === 0) return [];
    this._exporting = !0;
    try {
      return (await n("audit-trail", this._buildParams(1, t))).logEntries;
    } finally {
      this._exporting = !1;
    }
  }
  _downloadRows(e, t) {
    b(y("audit_log", this._dateFrom, this._dateTo, t), [
      ["Date", "Performer", "Performer Key", "IP", "Affected", "Affected Key", "Event", "Details"],
      ...e.map((i) => [
        u(i.eventDateUtc),
        i.performingDetails,
        i.performingUserKey,
        i.performingIP,
        i.affectedDetails,
        i.affectedUserKey,
        i.eventType,
        i.eventDetails
      ])
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
      this._notifyError("Could not export audit trail data.");
    }
  }
  _activeFilterChips() {
    const e = [], t = h.find((d) => d.key === this._datePreset), i = this._users.find((d) => String(d.id) === this._performingUserId), l = this._users.find((d) => String(d.id) === this._affectedUserId);
    return this._eventType && e.push({ label: `Event: ${this._eventType}`, onRemove: () => this._filterChange(() => this._eventType = "") }), i && e.push({ label: `Performer: ${i.username}`, onRemove: () => this._filterChange(() => this._performingUserId = "") }), l && e.push({ label: `Affected: ${l.username}`, onRemove: () => this._filterChange(() => this._affectedUserId = "") }), this._performingIp && e.push({ label: `IP: ${this._performingIp}`, onRemove: () => this._filterChange(() => this._performingIp = "") }), this._searchTerm && e.push({ label: `Search: ${this._searchTerm}`, onRemove: () => this._filterChange(() => this._searchTerm = "") }), (this._dateFrom || this._dateTo) && e.push({
      label: t ? t.label : `Date: ${this._dateFrom || "start"} to ${this._dateTo || "today"}`,
      onRemove: () => this._filterChange(() => {
        this._dateFrom = "", this._dateTo = "", this._datePreset = "";
      })
    }), e;
  }
  _renderSortHeader(e) {
    const t = this._sortColumn === e.key;
    return o`
            <button class="sort-button" type="button" @click=${() => this._sort(e.key)}>
                ${e.label}
                ${t ? o`<uui-icon name=${this._sortOrder === "asc" ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>` : ""}
            </button>
        `;
  }
  _renderPager() {
    if (!this._page || this._page.totalItems === 0) return "";
    const e = this._page.itemsPerPage * (this._page.currentPage - 1) + 1, t = e + this._page.logEntries.length - 1;
    return o`
            <div class="pager">
                <span>Entries ${e}-${t} of ${this._page.totalItems}</span>
                <label>
                    <select @change=${(i) => this._filterChange(() => this._itemsPerPage = Number(i.target.value))}>
                        ${T.map((i) => o`<option value=${i} ?selected=${this._itemsPerPage === i}>${i}</option>`)}
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
    return o`
            <umb-body-layout header-fit-height>
                <div class="page" slot="header">
                    <uui-box headline="Audit Log Viewer">
                        ${this._disableExport ? "" : o`
                                  <div slot="header-actions">
                                      <uui-button label="Export Page" ?disabled=${e.length === 0 || this._exporting} @click=${this._exportPageCsv}></uui-button>
                                      <uui-button look="primary" label="Export All" ?disabled=${e.length === 0 || this._exporting} @click=${() => void this._exportAllCsv()}></uui-button>
                                  </div>
                              `}
                        ${this._renderFilters()}
                        ${x(this._activeFilterChips(), () => this._reset())}
                    </uui-box>
                </div>
                <div class="page results">
                    ${this._loading ? o`<uui-loader></uui-loader>` : this._renderTable(e)}
                    ${this._renderPager()}
                </div>
            </umb-body-layout>
        `;
  }
  _renderFilters() {
    return o`
            <div class="filters">
                <label>
                    Event Type
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._eventType = t)}>
                        <option value="">Any</option>
                        ${this._eventTypes.map((e) => o`<option value=${e} ?selected=${this._eventType === e}>${e}</option>`)}
                    </select>
                </label>
                <label>
                    Performer
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._performingUserId = t)}>
                        <option value="">Any</option>
                        ${this._users.map((e) => o`<option value=${e.id} ?selected=${this._performingUserId === String(e.id)}>${e.username}</option>`)}
                    </select>
                </label>
                <label>
                    Affected
                    <select @change=${(e) => this._setTextFilter(e, (t) => this._affectedUserId = t)}>
                        <option value="">Any</option>
                        ${this._users.map((e) => o`<option value=${e.id} ?selected=${this._affectedUserId === String(e.id)}>${e.username}</option>`)}
                    </select>
                </label>
                <label>
                    IP
                    <uui-input
                        autocomplete="off"
                        name="diplo-audit-log-viewer-ip"
                        placeholder="IP address"
                        .value=${this._performingIp}
                        @change=${(e) => this._setTextFilter(e, (t) => this._performingIp = t)}></uui-input>
                </label>
                <label>
                    Search
                    <uui-input
                        type="search"
                        autocomplete="off"
                        name="diplo-audit-log-viewer-audit-search"
                        placeholder="Search audit trail"
                        .value=${this._searchTerm}
                        @change=${(e) => this._setTextFilter(e, (t) => this._searchTerm = t)}></uui-input>
                </label>
                <label>
                    Period
                    <select @change=${this._applyDatePreset}>
                        <option value="" ?selected=${this._datePreset === ""}>Custom</option>
                        ${h.map((e) => o`<option value=${e.key} ?selected=${this._datePreset === e.key}>${e.label}</option>`)}
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
    return e.length ? o`
            <div class="log-table audit-table">
                <div class="table-head">
                    ${I.map((t) => o`<div class="table-cell head-cell">${this._renderSortHeader(t)}</div>`)}
                </div>
                ${e.map((t) => this._renderRow(t))}
            </div>
        ` : o`<div class="empty">No log records found for your selected criteria.</div>`;
  }
  _renderRow(e) {
    const t = this._expanded.has(e.id);
    return o`
            <div class="table-row clickable" @click=${() => this._toggleDetails(e.id)}>
                <div class="table-cell">${u(e.eventDateUtc)}</div>
                <div class="table-cell">${e.performingDetails}</div>
                <div class="table-cell"><code>${e.performingIP}</code></div>
                <div class="table-cell">${e.affectedDetails}</div>
                <div class="table-cell"><code>${e.eventType}</code></div>
                <div class="table-cell">${e.eventDetails} <uui-icon name="icon-eye"></uui-icon></div>
            </div>
            ${t ? o`
                      <div class="detail-panel">
                          <dl class="details">
                              <div><dt>Performer</dt><dd>${e.performingDetails || "Unavailable"} <code>${e.performingUserId}</code></dd></div>
                              <div><dt>Performer key</dt><dd><code>${e.performingUserKey || "Unavailable"}</code></dd></div>
                              <div><dt>IP</dt><dd><code>${e.performingIP || "Unavailable"}</code></dd></div>
                              <div><dt>Affected</dt><dd>${e.affectedDetails || "Unavailable"} <code>${e.affectedUserId}</code></dd></div>
                              <div><dt>Affected key</dt><dd><code>${e.affectedUserKey || "Unavailable"}</code></dd></div>
                              <div><dt>Event</dt><dd><code>${e.eventType || "Unavailable"}</code></dd></div>
                              <div class="wide"><dt>Details</dt><dd>${e.eventDetails || "No event details recorded."}</dd></div>
                          </dl>
                      </div>
                  ` : ""}
        `;
  }
};
a.styles = g`
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
        .audit-table {
            grid-template-columns:
                minmax(160px, 0.8fr)
                minmax(220px, 1.2fr)
                minmax(100px, 0.6fr)
                minmax(220px, 1.2fr)
                minmax(180px, 1fr)
                minmax(220px, 1.4fr);
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
        .detail-panel {
            grid-column: 1 / -1;
            border-top: 1px solid var(--uui-color-border);
            border-bottom: 1px solid var(--uui-color-border);
            background: var(--uui-color-surface-alt);
        }
        .details {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
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
r([
  s()
], a.prototype, "_page", 2);
r([
  s()
], a.prototype, "_eventTypes", 2);
r([
  s()
], a.prototype, "_users", 2);
r([
  s()
], a.prototype, "_loading", 2);
r([
  s()
], a.prototype, "_currentPage", 2);
r([
  s()
], a.prototype, "_itemsPerPage", 2);
r([
  s()
], a.prototype, "_sortColumn", 2);
r([
  s()
], a.prototype, "_sortOrder", 2);
r([
  s()
], a.prototype, "_eventType", 2);
r([
  s()
], a.prototype, "_performingUserId", 2);
r([
  s()
], a.prototype, "_affectedUserId", 2);
r([
  s()
], a.prototype, "_performingIp", 2);
r([
  s()
], a.prototype, "_searchTerm", 2);
r([
  s()
], a.prototype, "_dateFrom", 2);
r([
  s()
], a.prototype, "_dateTo", 2);
r([
  s()
], a.prototype, "_datePreset", 2);
r([
  s()
], a.prototype, "_expanded", 2);
r([
  s()
], a.prototype, "_exporting", 2);
r([
  s()
], a.prototype, "_disableExport", 2);
a = r([
  f("diplo-audit-trail-page")
], a);
const D = a;
export {
  a as AuditTrailPageElement,
  D as default
};
//# sourceMappingURL=audit-trail.element.js.map
