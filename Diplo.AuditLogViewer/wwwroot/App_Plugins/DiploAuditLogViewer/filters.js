import { umbHttpClient as u } from "@umbraco-cms/backoffice/http-client";
import { A as m } from "./index2.js";
import { html as l } from "@umbraco-cms/backoffice/external/lit";
const g = [{ scheme: "bearer", type: "http" }];
function y(t) {
  if (!t) return "";
  const e = Object.entries(t).filter(([, n]) => n != null && n !== "").map(([n, a]) => `${encodeURIComponent(n)}=${encodeURIComponent(String(a))}`);
  return e.length ? `?${e.join("&")}` : "";
}
async function $(t, e) {
  const { data: n, error: a } = await u.get({
    url: `${m}/${t}${y(e)}`,
    security: g
  });
  if (a)
    throw a;
  return n;
}
function D(t) {
  if (!t) return "";
  const e = new Date(t);
  if (Number.isNaN(e.getTime())) return t;
  const n = new Intl.DateTimeFormat(void 0, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(e), a = new Intl.DateTimeFormat(void 0, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1
  }).format(e), i = String(e.getMilliseconds()).padStart(3, "0");
  return `${n} ${a}.${i}`;
}
function o(t) {
  const e = t.getFullYear(), n = String(t.getMonth() + 1).padStart(2, "0"), a = String(t.getDate()).padStart(2, "0");
  return `${e}-${n}-${a}`;
}
function w(t, e, n, a) {
  const i = e || n ? `_${e || "start"}_${n || "today"}` : "";
  return `${t}${i}_${a}_${o(/* @__PURE__ */ new Date())}.csv`;
}
function f(t) {
  const e = t == null ? "" : String(t);
  return /[",\r\n]/.test(e) ? `"${e.replace(/"/g, '""')}"` : e;
}
function R(t, e) {
  const n = e.map((c) => c.map(f).join(",")).join(`\r
`), a = new Blob([n], { type: "text/csv;charset=utf-8" }), i = URL.createObjectURL(a), r = document.createElement("a");
  r.href = i, r.download = t, r.rel = "noopener", r.addEventListener("click", (c) => c.stopImmediatePropagation()), document.body.appendChild(r), r.click(), document.body.removeChild(r), window.setTimeout(() => URL.revokeObjectURL(i), 1e3);
}
function s() {
  const t = /* @__PURE__ */ new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function d(t, e) {
  const n = new Date(t);
  return n.setDate(n.getDate() + e), n;
}
const T = [
  {
    key: "today",
    label: "Today",
    getRange: () => {
      const t = s();
      return { dateFrom: o(t), dateTo: o(t) };
    }
  },
  {
    key: "yesterday",
    label: "Yesterday",
    getRange: () => {
      const t = d(s(), -1);
      return { dateFrom: o(t), dateTo: o(t) };
    }
  },
  {
    key: "last7",
    label: "Last 7 days",
    getRange: () => {
      const t = s();
      return { dateFrom: o(d(t, -6)), dateTo: o(t) };
    }
  },
  {
    key: "last30",
    label: "Last 30 days",
    getRange: () => {
      const t = s();
      return { dateFrom: o(d(t, -29)), dateTo: o(t) };
    }
  },
  {
    key: "thisMonth",
    label: "This month",
    getRange: () => {
      const t = s();
      return { dateFrom: o(new Date(t.getFullYear(), t.getMonth(), 1)), dateTo: o(t) };
    }
  },
  {
    key: "previousMonth",
    label: "Previous month",
    getRange: () => {
      const t = s(), e = new Date(t.getFullYear(), t.getMonth() - 1, 1), n = new Date(t.getFullYear(), t.getMonth(), 0);
      return { dateFrom: o(e), dateTo: o(n) };
    }
  }
];
function F(t, e) {
  return t.length === 0 ? "" : l`
        <div class="filter-chips" aria-label="Active filters">
            ${t.map(
    (n) => l`
                    <uui-tag>
                        ${n.label}
                        <uui-button compact label="Remove ${n.label}" @click=${n.onRemove}>
                            <uui-icon name="icon-delete"></uui-icon>
                        </uui-button>
                    </uui-tag>
                `
  )}
            <uui-button compact label="Clear all" @click=${e}></uui-button>
        </div>
    `;
}
export {
  T as D,
  $ as a,
  R as d,
  D as f,
  w as m,
  F as r
};
//# sourceMappingURL=filters.js.map
