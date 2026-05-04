export interface BasicUser {
    id: number;
    username: string;
}

export interface PageResult<T> {
    logEntries: T[];
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
}

export interface AuditLogViewerSettings {
    disableExport: boolean;
}

export interface ContentLogEntry {
    id: number;
    uniqueId?: string | null;
    nodeExists: boolean;
    text?: string | null;
    userName?: string | null;
    dateStamp: string;
    logHeader?: string | null;
    logComment?: string | null;
    parameters?: string | null;
    entityType?: string | null;
    nodeId: number;
    alias?: string | null;
    typeId?: string | null;
    typeDesc?: string | null;
    icon?: string | null;
}

export interface LoggedNodeSuggestion {
    nodeId: number;
    uniqueId?: string | null;
    nodeExists: boolean;
    name?: string | null;
    entityType?: string | null;
}

export interface AuditTrailEntry {
    id: number;
    performingUserId: number;
    performingUserKey?: string | null;
    performingDetails?: string | null;
    performingIP?: string | null;
    eventDateUtc: string;
    affectedUserId: number;
    affectedUserKey?: string | null;
    affectedDetails?: string | null;
    eventType?: string | null;
    eventDetails?: string | null;
}

export type SortOrder = "asc" | "desc";

export interface ColumnDef {
    key: string;
    label: string;
}
