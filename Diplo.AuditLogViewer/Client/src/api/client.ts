import { umbHttpClient } from "@umbraco-cms/backoffice/http-client";
import { AUDIT_LOG_VIEWER_API_BASE } from "../constants";

const BEARER_SECURITY = [{ scheme: "bearer", type: "http" }] as const;

function buildQuery(query?: Record<string, unknown>): string {
    if (!query) return "";

    const parts = Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    return parts.length ? `?${parts.join("&")}` : "";
}

export async function auditLogViewerGet<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    const { data, error } = await umbHttpClient.get<T>({
        url: `${AUDIT_LOG_VIEWER_API_BASE}/${path}${buildQuery(query)}`,
        security: BEARER_SECURITY
    });

    if (error) {
        throw error;
    }

    return data as T;
}
