export function formatDate(value: string | null | undefined): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const datePart = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
    const timePart = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(date);
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${datePart} ${timePart}.${milliseconds}`;
}

export function toDateInputValue(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function makeLogFilename(prefix: string, dateFrom: string, dateTo: string, scope: "page" | "all"): string {
    const range = dateFrom || dateTo ? `_${dateFrom || "start"}_${dateTo || "today"}` : "";
    return `${prefix}${range}_${scope}_${toDateInputValue(new Date())}.csv`;
}

export function csvEscape(value: unknown): string {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, rows: unknown[][]): void {
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    link.addEventListener("click", (event) => event.stopImmediatePropagation());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
