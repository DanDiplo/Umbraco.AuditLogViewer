import { LitElement, css, customElement, html, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT, type UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { auditLogViewerGet } from "../api/client";
import type { AuditLogViewerSettings, ColumnDef, ContentLogEntry, LoggedNodeSuggestion, PageResult, SortOrder } from "../types";
import { canOpenLogEntity, openLogEntityEditorModal } from "../shared/edit-links";
import { DATE_PRESETS, type DatePresetKey, renderFilterChips } from "../shared/filters";
import { downloadCsv, formatDate, makeLogFilename } from "../shared/format";

const PAGE_SIZES = [10, 20, 50, 100, 200, 500] as const;
const COLUMNS: ColumnDef[] = [
    { key: "L.Datestamp", label: "Date" },
    { key: "U.userName", label: "User" },
    { key: "L.logHeader", label: "Action" },
    { key: "L.nodeId", label: "Node" },
    { key: "N.text", label: "Content" },
    { key: "N.nodeObjectType", label: "Type" }
];

@customElement("diplo-content-log-page")
export class ContentLogPageElement extends UmbElementMixin(LitElement) {
    @state() private _page: PageResult<ContentLogEntry> | null = null;
    @state() private _logTypes: string[] = [];
    @state() private _entityTypes: string[] = [];
    @state() private _users: string[] = [];
    @state() private _loading = false;
    @state() private _expanded = new Set<number>();
    @state() private _currentPage = 1;
    @state() private _itemsPerPage = 50;
    @state() private _sortColumn = "L.Datestamp";
    @state() private _sortOrder: SortOrder = "desc";
    @state() private _logType = "";
    @state() private _entityType = "";
    @state() private _userName = "";
    @state() private _searchTerm = "";
    @state() private _nodeId = "";
    @state() private _nodeQuery = "";
    @state() private _nodeLabel = "";
    @state() private _nodeSuggestions: LoggedNodeSuggestion[] = [];
    @state() private _showNodeSuggestions = false;
    @state() private _dateFrom = "";
    @state() private _dateTo = "";
    @state() private _datePreset: DatePresetKey = "";
    @state() private _exporting = false;
    @state() private _disableExport = false;
    private _nodeSearchTimer?: number;
    private _notifications?: UmbNotificationContext;

    constructor() {
        super();
        this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx) => {
            this._notifications = ctx;
        });
    }

    override connectedCallback(): void {
        super.connectedCallback();
        void this._loadSettings();
        void this._loadFilters();
        void this._fetch();
    }

    private async _loadSettings() {
        try {
            const settings = await auditLogViewerGet<AuditLogViewerSettings>("settings");
            this._disableExport = settings.disableExport;
        } catch {
            this._notifyError("Could not load Audit Log Viewer settings.");
        }
    }

    private async _loadFilters() {
        try {
            const [types, users, entityTypes] = await Promise.all([
                auditLogViewerGet<string[]>("content-log/types"),
                auditLogViewerGet<string[]>("content-log/users"),
                auditLogViewerGet<string[]>("content-log/entity-types")
            ]);
            this._logTypes = types;
            this._users = users;
            this._entityTypes = entityTypes;
        } catch {
            this._notifyError("Could not load content log filters.");
        }
    }

    private async _fetch() {
        this._loading = true;
        try {
            this._page = await auditLogViewerGet<PageResult<ContentLogEntry>>("content-log", this._buildParams(this._currentPage, this._itemsPerPage));
            this._currentPage = this._page.currentPage;
        } catch {
            this._notifyError("Could not load content log data.");
        } finally {
            this._loading = false;
        }
    }

    private _notifyError(message: string) {
        this._notifications?.peek("danger", { data: { headline: "Audit Log Viewer", message } });
    }

    private _filterChange(fn: () => void) {
        fn();
        this._currentPage = 1;
        void this._fetch();
    }

    private _setTextFilter(event: Event, setter: (value: string) => void) {
        this._filterChange(() => setter((event.target as HTMLInputElement).value));
    }

    private _setNodeQuery(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this._nodeQuery = value;
        this._nodeLabel = "";

        if (this._nodeSearchTimer) {
            window.clearTimeout(this._nodeSearchTimer);
        }

        if (!value.trim()) {
            this._filterChange(() => {
                this._nodeId = "";
                this._nodeSuggestions = [];
                this._showNodeSuggestions = false;
            });
            return;
        }

        if (/^\d+$/.test(value.trim())) {
            this._nodeSearchTimer = window.setTimeout(() => {
                this._filterChange(() => (this._nodeId = value.trim()));
                void this._loadNodeSuggestions(value.trim());
            }, 300);
            return;
        }

        this._nodeSearchTimer = window.setTimeout(() => void this._loadNodeSuggestions(value), 300);
    }

    private async _loadNodeSuggestions(term: string) {
        try {
            this._nodeSuggestions = await auditLogViewerGet<LoggedNodeSuggestion[]>("content-log/nodes", { term, take: 10 });
            this._showNodeSuggestions = this._nodeSuggestions.length > 0;
        } catch {
            this._nodeSuggestions = [];
            this._showNodeSuggestions = false;
        }
    }

    private _selectNodeSuggestion(node: LoggedNodeSuggestion) {
        const label = this._nodeDisplayName(node);
        this._filterChange(() => {
            this._nodeId = String(node.nodeId);
            this._nodeLabel = label;
            this._nodeQuery = label;
            this._nodeSuggestions = [];
            this._showNodeSuggestions = false;
        });
    }

    private _nodeDisplayName(node: LoggedNodeSuggestion): string {
        return `${node.name || `Node #${node.nodeId}`} (#${node.nodeId})`;
    }

    private _iconName(icon: string | null | undefined): string {
        return icon?.split(/\s+/)[0] ?? "";
    }

    private _hideNodeSuggestionsSoon() {
        window.setTimeout(() => {
            this._showNodeSuggestions = false;
        }, 150);
    }

    private _buildParams(pageNumber: number, itemsPerPage: number) {
        return {
            logType: this._logType,
            entityType: this._entityType,
            userName: this._userName,
            searchTerm: this._searchTerm,
            nodeId: this._nodeId,
            dateFrom: this._dateFrom,
            dateTo: this._dateTo,
            itemsPerPage,
            pageNumber,
            sortColumn: this._sortColumn,
            sortOrder: this._sortOrder
        };
    }

    private _sort(column: string) {
        if (this._sortColumn === column) {
            this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc";
        } else {
            this._sortColumn = column;
            this._sortOrder = "asc";
        }
        this._currentPage = 1;
        void this._fetch();
    }

    private _setPage(page: number) {
        if (!this._page || page < 1 || page > this._page.totalPages || page === this._currentPage) return;
        this._currentPage = page;
        void this._fetch();
    }

    private _reset() {
        this._logType = "";
        this._entityType = "";
        this._userName = "";
        this._searchTerm = "";
        this._nodeId = "";
        this._nodeQuery = "";
        this._nodeLabel = "";
        this._nodeSuggestions = [];
        this._showNodeSuggestions = false;
        this._dateFrom = "";
        this._dateTo = "";
        this._datePreset = "";
        this._currentPage = 1;
        void this._fetch();
    }

    private _applyDatePreset(event: Event) {
        const presetKey = (event.target as HTMLSelectElement).value as DatePresetKey;
        const preset = DATE_PRESETS.find((item) => item.key === presetKey);

        this._filterChange(() => {
            this._datePreset = presetKey;
            if (preset) {
                const range = preset.getRange();
                this._dateFrom = range.dateFrom;
                this._dateTo = range.dateTo;
            }
        });
    }

    private _setDate(event: Event, setter: (value: string) => void) {
        this._filterChange(() => {
            this._datePreset = "";
            setter((event.target as HTMLInputElement).value);
        });
    }

    private _toggleDetails(id: number) {
        const expanded = new Set(this._expanded);
        expanded.has(id) ? expanded.delete(id) : expanded.add(id);
        this._expanded = expanded;
    }

    private async _getRowsForExport(scope: "page" | "all") {
        if (scope === "page") return this._page?.logEntries ?? [];

        const totalItems = this._page?.totalItems ?? 0;
        if (totalItems === 0) return [];

        this._exporting = true;
        try {
            const result = await auditLogViewerGet<PageResult<ContentLogEntry>>("content-log", this._buildParams(1, totalItems));
            return result.logEntries;
        } finally {
            this._exporting = false;
        }
    }

    private _downloadRows(rows: ContentLogEntry[], scope: "page" | "all") {
        downloadCsv(makeLogFilename("content_log", this._dateFrom, this._dateTo, scope), [
            ["Date", "User", "Action", "Node", "Content", "Type", "Entity Type", "Parameters"],
            ...rows.map((row) => [formatDate(row.dateStamp), row.userName, row.logHeader, row.nodeId, row.text, row.typeDesc, row.entityType, row.parameters])
        ]);
    }

    private _exportPageCsv() {
        this._downloadRows(this._page?.logEntries ?? [], "page");
    }

    private async _exportAllCsv() {
        try {
            this._downloadRows(await this._getRowsForExport("all"), "all");
        } catch {
            this._notifyError("Could not export content log data.");
        }
    }

    private _activeFilterChips() {
        const chips = [];
        const preset = DATE_PRESETS.find((item) => item.key === this._datePreset);
        if (this._logType) chips.push({ label: `Type: ${this._logType}`, onRemove: () => this._filterChange(() => (this._logType = "")) });
        if (this._entityType) chips.push({ label: `Entity: ${this._entityType}`, onRemove: () => this._filterChange(() => (this._entityType = "")) });
        if (this._userName) chips.push({ label: `User: ${this._userName}`, onRemove: () => this._filterChange(() => (this._userName = "")) });
        if (this._searchTerm) chips.push({ label: `Search: ${this._searchTerm}`, onRemove: () => this._filterChange(() => (this._searchTerm = "")) });
        if (this._nodeId) {
            chips.push({
                label: `Node: ${this._nodeLabel || this._nodeId}`,
                onRemove: () => this._filterChange(() => {
                    this._nodeId = "";
                    this._nodeQuery = "";
                    this._nodeLabel = "";
                    this._nodeSuggestions = [];
                    this._showNodeSuggestions = false;
                })
            });
        }
        if (this._dateFrom || this._dateTo) {
            chips.push({
                label: preset ? preset.label : `Date: ${this._dateFrom || "start"} to ${this._dateTo || "today"}`,
                onRemove: () => this._filterChange(() => {
                    this._dateFrom = "";
                    this._dateTo = "";
                    this._datePreset = "";
                })
            });
        }
        return chips;
    }

    private _renderSortHeader(column: ColumnDef) {
        const active = this._sortColumn === column.key;
        return html`
            <button class="sort-button" type="button" @click=${() => this._sort(column.key)}>
                ${column.label}
                ${active ? html`<uui-icon name=${this._sortOrder === "asc" ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>` : ""}
            </button>
        `;
    }

    private _renderPager() {
        if (!this._page || this._page.totalItems === 0) return "";
        const from = this._page.itemsPerPage * (this._page.currentPage - 1) + 1;
        const to = from + this._page.logEntries.length - 1;

        return html`
            <div class="pager">
                <span>Entries ${from}-${to} of ${this._page.totalItems}</span>
                <label>
                    <select @change=${(event: Event) => this._filterChange(() => (this._itemsPerPage = Number((event.target as HTMLSelectElement).value)))}>
                        ${PAGE_SIZES.map((size) => html`<option value=${size} ?selected=${this._itemsPerPage === size}>${size}</option>`)}
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

    override render() {
        const rows = this._page?.logEntries ?? [];

        return html`
            <umb-body-layout header-fit-height>
                <div class="page" slot="header">
                    <uui-box headline="Content Log Viewer">
                        ${!this._disableExport
                            ? html`
                                  <div slot="header-actions">
                                      <uui-button label="Export Page" ?disabled=${rows.length === 0 || this._exporting} @click=${this._exportPageCsv}></uui-button>
                                      <uui-button look="primary" label="Export All" ?disabled=${rows.length === 0 || this._exporting} @click=${() => void this._exportAllCsv()}></uui-button>
                                  </div>
                              `
                            : ""}
                        ${this._renderFilters()}
                        ${renderFilterChips(this._activeFilterChips(), () => this._reset())}
                    </uui-box>
                </div>
                <div class="page results">
                    ${this._loading ? html`<uui-loader></uui-loader>` : this._renderTable(rows)}
                    ${this._renderPager()}
                </div>
            </umb-body-layout>
        `;
    }

    private _renderFilters() {
        return html`
            <div class="filters">
                <label>
                    Log Type
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._logType = value))}>
                        <option value="">Any</option>
                        ${this._logTypes.map((type) => html`<option value=${type} ?selected=${this._logType === type}>${type}</option>`)}
                    </select>
                </label>
                <label>
                    Entity Type
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._entityType = value))}>
                        <option value="">Any</option>
                        ${this._entityTypes.map((type) => html`<option value=${type} ?selected=${this._entityType === type}>${type}</option>`)}
                    </select>
                </label>
                <label>
                    User
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._userName = value))}>
                        <option value="">Any</option>
                        ${this._users.map((user) => html`<option value=${user} ?selected=${this._userName === user}>${user}</option>`)}
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
                        @change=${(event: Event) => this._setTextFilter(event, (value) => (this._searchTerm = value))}></uui-input>
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
                            @focus=${() => (this._showNodeSuggestions = this._nodeSuggestions.length > 0)}
                            @blur=${this._hideNodeSuggestionsSoon}></uui-input>
                        ${this._showNodeSuggestions
                            ? html`
                                  <div class="node-suggestions">
                                      ${this._nodeSuggestions.map(
                                          (node) => html`
                                              <button type="button" @click=${() => this._selectNodeSuggestion(node)}>
                                                  <span>${node.name || `Node #${node.nodeId}`}</span>
                                                  <small>#${node.nodeId} ${node.entityType ? html`&middot; ${node.entityType}` : ""} ${node.nodeExists ? "" : html`&middot; missing`}</small>
                                              </button>
                                          `
                                      )}
                                  </div>
                              `
                            : ""}
                    </div>
                </label>
                <label>
                    Period
                    <select @change=${this._applyDatePreset}>
                        <option value="" ?selected=${this._datePreset === ""}>Custom</option>
                        ${DATE_PRESETS.map((preset) => html`<option value=${preset.key} ?selected=${this._datePreset === preset.key}>${preset.label}</option>`)}
                    </select>
                </label>
                <label>
                    From
                    <input type="date" .value=${this._dateFrom} @change=${(event: Event) => this._setDate(event, (value) => (this._dateFrom = value))} />
                </label>
                <label>
                    To
                    <input type="date" .value=${this._dateTo} @change=${(event: Event) => this._setDate(event, (value) => (this._dateTo = value))} />
                </label>
            </div>
        `;
    }

    private _renderTable(rows: ContentLogEntry[]) {
        if (!rows.length) {
            return html`<div class="empty">No log records found for your selected criteria.</div>`;
        }

        return html`
            <div class="log-table content-table">
                <div class="table-head">
                    ${COLUMNS.map((column) => html`<div class="table-cell head-cell">${this._renderSortHeader(column)}</div>`)}
                </div>
                ${rows.map((row) => this._renderRow(row))}
            </div>
        `;
    }

    private _renderRow(row: ContentLogEntry) {
        const hasDetails = !!(row.logComment || row.parameters || row.entityType || row.alias || row.typeDesc || row.uniqueId || row.nodeId);
        const isExpanded = this._expanded.has(row.id);

        return html`
            <div class="table-row clickable" @click=${() => this._toggleDetails(row.id)}>
                <div class="table-cell">${formatDate(row.dateStamp)}</div>
                <div class="table-cell">${row.userName}</div>
                <div class="table-cell">${row.logHeader}${hasDetails ? html` <uui-icon name="icon-eye"></uui-icon>` : ""}</div>
                <div class="table-cell">
                    ${row.nodeId > 0 && row.uniqueId && canOpenLogEntity(row.entityType)
                        ? html`<a href="" @click=${(event: Event) => openLogEntityEditorModal(this, row.uniqueId, row.entityType, event)}>${row.nodeId}</a>`
                        : row.nodeId > 0
                          ? row.nodeId
                          : ""}
                    ${row.nodeId > 0 ? html`<uui-tag color=${row.nodeExists ? "positive" : "warning"}>${row.nodeExists ? "Exists" : "Missing"}</uui-tag>` : ""}
                </div>
                <div class="table-cell content-cell">${row.icon ? html`<uui-icon name=${this._iconName(row.icon)} title=${row.alias ?? ""}></uui-icon>` : ""}<span>${row.text}</span></div>
                <div class="table-cell">${row.typeDesc}</div>
            </div>
            ${isExpanded
                ? html`
                      <div class="detail-panel">
                          <dl class="details">
                              <div class="wide"><dt>Comment</dt><dd>${row.logComment || "No comment recorded."}</dd></div>
                              <div class="wide"><dt>Parameters</dt><dd>${row.parameters || "No parameters recorded."}</dd></div>
                              <div><dt>Entity type</dt><dd>${row.entityType || "Unavailable"}</dd></div>
                              <div><dt>Node key</dt><dd><code>${row.uniqueId || "Unavailable"}</code></dd></div>
                              <div><dt>Document type</dt><dd>${row.alias || row.typeDesc || "Unavailable"}</dd></div>
                              <div><dt>Status</dt><dd>${row.nodeExists ? "Node exists" : "Node no longer exists or cannot be resolved"}</dd></div>
                          </dl>
                      </div>
                  `
                : ""}
        `;
    }

    static override styles = css`
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
}

export default ContentLogPageElement;

declare global {
    interface HTMLElementTagNameMap {
        "diplo-content-log-page": ContentLogPageElement;
    }
}
