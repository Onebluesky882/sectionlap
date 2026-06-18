"use client";

import { useState, useMemo } from "react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  pageSize?: number;
  searchKeys?: (keyof T)[];
  emptyText?: string;
  keyField: keyof T;
};

type SortDir = "asc" | "desc";

function getValue<T extends Record<string, unknown>>(row: T, key: string): unknown {
  return key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], row);
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  pageSize = 10,
  searchKeys = [],
  emptyText = "ไม่มีข้อมูล",
  keyField,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(getValue(row, k as string) ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(getValue(a, sortKey) ?? "");
      const bv = String(getValue(b, sortKey) ?? "");
      const n = isNaN(Number(av)) || isNaN(Number(bv))
        ? av.localeCompare(bv)
        : Number(av) - Number(bv);
      return sortDir === "asc" ? n : -n;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <input
          type="text"
          placeholder="ค้นหา..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                  className={[
                    "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap select-none",
                    col.sortable ? "cursor-pointer hover:text-black" : "",
                    col.className ?? "",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                    {col.sortable && sortKey !== String(col.key) && (
                      <span className="text-gray-300">↕</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={["px-4 py-3 align-middle", col.className ?? ""].join(" ")}>
                      {col.render
                        ? col.render(row)
                        : String(getValue(row, String(col.key)) ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{sorted.length} รายการ</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  p === page ? "bg-black text-white border-black" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
