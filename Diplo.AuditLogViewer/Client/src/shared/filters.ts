import { html, type TemplateResult } from "@umbraco-cms/backoffice/external/lit";
import { toDateInputValue } from "./format";

export type DatePresetKey = "" | "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "previousMonth";

export interface DatePreset {
    key: DatePresetKey;
    label: string;
    getRange: () => { dateFrom: string; dateTo: string };
}

function startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(value: Date, days: number): Date {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
}

export const DATE_PRESETS: DatePreset[] = [
    {
        key: "today",
        label: "Today",
        getRange: () => {
            const today = startOfToday();
            return { dateFrom: toDateInputValue(today), dateTo: toDateInputValue(today) };
        }
    },
    {
        key: "yesterday",
        label: "Yesterday",
        getRange: () => {
            const yesterday = addDays(startOfToday(), -1);
            return { dateFrom: toDateInputValue(yesterday), dateTo: toDateInputValue(yesterday) };
        }
    },
    {
        key: "last7",
        label: "Last 7 days",
        getRange: () => {
            const today = startOfToday();
            return { dateFrom: toDateInputValue(addDays(today, -6)), dateTo: toDateInputValue(today) };
        }
    },
    {
        key: "last30",
        label: "Last 30 days",
        getRange: () => {
            const today = startOfToday();
            return { dateFrom: toDateInputValue(addDays(today, -29)), dateTo: toDateInputValue(today) };
        }
    },
    {
        key: "thisMonth",
        label: "This month",
        getRange: () => {
            const today = startOfToday();
            return { dateFrom: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)), dateTo: toDateInputValue(today) };
        }
    },
    {
        key: "previousMonth",
        label: "Previous month",
        getRange: () => {
            const today = startOfToday();
            const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const last = new Date(today.getFullYear(), today.getMonth(), 0);
            return { dateFrom: toDateInputValue(first), dateTo: toDateInputValue(last) };
        }
    }
];

export interface FilterChip {
    label: string;
    onRemove: () => void;
}

export function renderFilterChips(chips: FilterChip[], reset: () => void): TemplateResult | string {
    if (chips.length === 0) return "";

    return html`
        <div class="filter-chips" aria-label="Active filters">
            ${chips.map(
                (chip) => html`
                    <uui-tag>
                        ${chip.label}
                        <uui-button compact label="Remove ${chip.label}" @click=${chip.onRemove}>
                            <uui-icon name="icon-delete"></uui-icon>
                        </uui-button>
                    </uui-tag>
                `
            )}
            <uui-button compact label="Clear all" @click=${reset}></uui-button>
        </div>
    `;
}
