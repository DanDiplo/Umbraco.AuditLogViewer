import { LitElement, css, customElement, html, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT, type UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { auditLogViewerGet } from "../api/client";
import type { AuditLogViewerSettings, AuditTrailEntry, BasicUser, ColumnDef, PageResult, SortOrder } from "../types";
import { DATE_PRESETS, type DatePresetKey, renderFilterChips } from "../shared/filters";
import { downloadCsv, formatDate, makeLogFilename } from "../shared/format";

const PAGE_SIZES = [10, 20, 50, 100, 200, 500] as const;
const COLUMNS: ColumnDef[] = [
    { key: "eventDateUtc", label: "Date" },
    { key: "performingDetails", label: "Performer" },
    { key: "performingIp", label: "IP" },
    { key: "affectedDetails", label: "Affected" },
    { key: "eventType", label: "Event" },
    { key: "eventDetails", label: "Details" }
];

@customElement("diplo-audit-trail-page")
export class AuditTrailPageElement extends UmbElementMixin(LitElement) {
    @state() private _page: PageResult<AuditTrailEntry> | null = null;
    @state() private _eventTypes: string[] = [];
    @state() private _users: BasicUser[] = [];
    @state() private _loading = false;
    @state() private _currentPage = 1;
    @state() private _itemsPerPage = 50;
    @state() private _sortColumn = "eventDateUtc";
    @state() private _sortOrder: SortOrder = "desc";
    @state() private _eventType = "";
    @state() private _performingUserId = "";
    @state() private _affectedUserId = "";
    @state() private _performingIp = "";
    @state() private _searchTerm = "";
    @state() private _dateFrom = "";
    @state() private _dateTo = "";
    @state() private _datePreset: DatePresetKey = "";
    @state() private _expanded = new Set<number>();
    @state() private _exporting = false;
    @state() private _disableExport = false;
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
            const [types, users] = await Promise.all([
                auditLogViewerGet<string[]>("audit-trail/event-types"),
                auditLogViewerGet<BasicUser[]>("audit-trail/users")
            ]);
            this._eventTypes = types;
            this._users = users;
        } catch {
            this._notifyError("Could not load audit trail filters.");
        }
    }

    private async _fetch() {
        this._loading = true;
        try {
            this._page = await auditLogViewerGet<PageResult<AuditTrailEntry>>("audit-trail", this._buildParams(this._currentPage, this._itemsPerPage));
            this._currentPage = this._page.currentPage;
        } catch {
            this._notifyError("Could not load audit trail data.");
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

    private _buildParams(pageNumber: number, itemsPerPage: number) {
        return {
            eventType: this._eventType,
            performingUserId: this._performingUserId,
            affectedUserId: this._affectedUserId,
            performingIp: this._performingIp,
            searchTerm: this._searchTerm,
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
        this._eventType = "";
        this._performingUserId = "";
        this._affectedUserId = "";
        this._performingIp = "";
        this._searchTerm = "";
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
            const result = await auditLogViewerGet<PageResult<AuditTrailEntry>>("audit-trail", this._buildParams(1, totalItems));
            return result.logEntries;
        } finally {
            this._exporting = false;
        }
    }

    private _downloadRows(rows: AuditTrailEntry[], scope: "page" | "all") {
        downloadCsv(makeLogFilename("audit_log", this._dateFrom, this._dateTo, scope), [
            ["Date", "Performer", "Performer Key", "IP", "Affected", "Affected Key", "Event", "Details"],
            ...rows.map((row) => [
                formatDate(row.eventDateUtc),
                row.performingDetails,
                row.performingUserKey,
                row.performingIP,
                row.affectedDetails,
                row.affectedUserKey,
                row.eventType,
                row.eventDetails
            ])
        ]);
    }

    private _exportPageCsv() {
        this._downloadRows(this._page?.logEntries ?? [], "page");
    }

    private async _exportAllCsv() {
        try {
            this._downloadRows(await this._getRowsForExport("all"), "all");
        } catch {
            this._notifyError("Could not export audit trail data.");
        }
    }

    private _activeFilterChips() {
        const chips = [];
        const preset = DATE_PRESETS.find((item) => item.key === this._datePreset);
        const performer = this._users.find((user) => String(user.id) === this._performingUserId);
        const affected = this._users.find((user) => String(user.id) === this._affectedUserId);

        if (this._eventType) chips.push({ label: `Event: ${this._eventType}`, onRemove: () => this._filterChange(() => (this._eventType = "")) });
        if (performer) chips.push({ label: `Performer: ${performer.username}`, onRemove: () => this._filterChange(() => (this._performingUserId = "")) });
        if (affected) chips.push({ label: `Affected: ${affected.username}`, onRemove: () => this._filterChange(() => (this._affectedUserId = "")) });
        if (this._performingIp) chips.push({ label: `IP: ${this._performingIp}`, onRemove: () => this._filterChange(() => (this._performingIp = "")) });
        if (this._searchTerm) chips.push({ label: `Search: ${this._searchTerm}`, onRemove: () => this._filterChange(() => (this._searchTerm = "")) });
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
                    <uui-box headline="Audit Log Viewer">
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
                    Event Type
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._eventType = value))}>
                        <option value="">Any</option>
                        ${this._eventTypes.map((type) => html`<option value=${type} ?selected=${this._eventType === type}>${type}</option>`)}
                    </select>
                </label>
                <label>
                    Performer
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._performingUserId = value))}>
                        <option value="">Any</option>
                        ${this._users.map((user) => html`<option value=${user.id} ?selected=${this._performingUserId === String(user.id)}>${user.username}</option>`)}
                    </select>
                </label>
                <label>
                    Affected
                    <select @change=${(event: Event) => this._setTextFilter(event, (value) => (this._affectedUserId = value))}>
                        <option value="">Any</option>
                        ${this._users.map((user) => html`<option value=${user.id} ?selected=${this._affectedUserId === String(user.id)}>${user.username}</option>`)}
                    </select>
                </label>
                <label>
                    IP
                    <uui-input
                        autocomplete="off"
                        name="diplo-audit-log-viewer-ip"
                        placeholder="IP address"
                        .value=${this._performingIp}
                        @change=${(event: Event) => this._setTextFilter(event, (value) => (this._performingIp = value))}></uui-input>
                </label>
                <label>
                    Search
                    <uui-input
                        type="search"
                        autocomplete="off"
                        name="diplo-audit-log-viewer-audit-search"
                        placeholder="Search audit trail"
                        .value=${this._searchTerm}
                        @change=${(event: Event) => this._setTextFilter(event, (value) => (this._searchTerm = value))}></uui-input>
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

    private _renderTable(rows: AuditTrailEntry[]) {
        if (!rows.length) {
            return html`<div class="empty">No log records found for your selected criteria.</div>`;
        }

        return html`
            <div class="log-table audit-table">
                <div class="table-head">
                    ${COLUMNS.map((column) => html`<div class="table-cell head-cell">${this._renderSortHeader(column)}</div>`)}
                </div>
                ${rows.map((row) => this._renderRow(row))}
            </div>
        `;
    }

    private _renderRow(row: AuditTrailEntry) {
        const isExpanded = this._expanded.has(row.id);
        return html`
            <div class="table-row clickable" @click=${() => this._toggleDetails(row.id)}>
                <div class="table-cell">${formatDate(row.eventDateUtc)}</div>
                <div class="table-cell">${row.performingDetails}</div>
                <div class="table-cell"><code>${row.performingIP}</code></div>
                <div class="table-cell">${row.affectedDetails}</div>
                <div class="table-cell"><code>${row.eventType}</code></div>
                <div class="table-cell">${row.eventDetails} <uui-icon name="icon-eye"></uui-icon></div>
            </div>
            ${isExpanded
                ? html`
                      <div class="detail-panel">
                          <dl class="details">
                              <div><dt>Performer</dt><dd>${row.performingDetails || "Unavailable"} <code>${row.performingUserId}</code></dd></div>
                              <div><dt>Performer key</dt><dd><code>${row.performingUserKey || "Unavailable"}</code></dd></div>
                              <div><dt>IP</dt><dd><code>${row.performingIP || "Unavailable"}</code></dd></div>
                              <div><dt>Affected</dt><dd>${row.affectedDetails || "Unavailable"} <code>${row.affectedUserId}</code></dd></div>
                              <div><dt>Affected key</dt><dd><code>${row.affectedUserKey || "Unavailable"}</code></dd></div>
                              <div><dt>Event</dt><dd><code>${row.eventType || "Unavailable"}</code></dd></div>
                              <div class="wide"><dt>Details</dt><dd>${row.eventDetails || "No event details recorded."}</dd></div>
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
}

export default AuditTrailPageElement;

declare global {
    interface HTMLElementTagNameMap {
        "diplo-audit-trail-page": AuditTrailPageElement;
    }
}
