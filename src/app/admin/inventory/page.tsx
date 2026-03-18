import { listInventory } from "@/db/queries/admin-inventory";
import Link from "next/link";

export const metadata = { title: "Inventory — Admin" };

const FILTERS = [
  { value: "all", label: "All Products" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

function StockBar({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0)
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-red-500/30">
          <div className="h-full w-0 bg-red-500" />
        </div>
        <span className="text-xs font-bold text-red-400">0</span>
      </div>
    );

  const max = Math.max(threshold * 3, qty, 50);
  const pct = Math.min(100, (qty / max) * 100);
  const isLow = qty <= threshold;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5">
        <div
          className={`h-full transition-all ${isLow ? "bg-amber-400" : "bg-acid"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${isLow ? "text-amber-400" : "text-chalk-2"}`}>
        {qty}
      </span>
    </div>
  );
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const { q, filter, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const perPage = 25;
  const currentFilter = (filter ?? "all") as FilterValue;

  const { rows, total, summary } = await listInventory({
    search: q,
    filter: currentFilter,
    page,
    perPage,
  });

  const totalPages = Math.ceil(total / perPage);

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(q ? { q } : {}),
      filter: currentFilter,
      page: String(page),
      ...overrides,
    });
    return `/admin/inventory?${p}`;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Inventory</h1>
          <p className="text-sm text-chalk-3 mt-1">
            {summary.total} products · {summary.lowStock} low stock · {summary.outOfStock} out of stock
          </p>
        </div>
      </div>

      {/* Alert banner */}
      {summary.lowStock > 0 || summary.outOfStock > 0 ? (
        <div className="flex gap-3 mb-5">
          {summary.outOfStock > 0 && (
            <a
              href={href({ filter: "out_of_stock", page: "1" })}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-sm text-red-400 hover:bg-red-500/15 transition-colors"
            >
              <span className="text-base">🚨</span>
              <span className="font-semibold">{summary.outOfStock} out of stock</span>
            </a>
          )}
          {summary.lowStock > 0 && (
            <a
              href={href({ filter: "low_stock", page: "1" })}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-sm text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              <span className="text-base">⚠️</span>
              <span className="font-semibold">{summary.lowStock} running low</span>
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-[rgba(204,255,0,.06)] border border-acid/20 text-sm text-acid w-fit">
          <span>✓</span>
          <span className="font-semibold">All products are well-stocked</span>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex items-center gap-4 mb-5">
        <form method="GET" action="/admin/inventory" className="flex gap-2">
          <input type="hidden" name="filter" value={currentFilter} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or SKU…"
            className="bg-surface border border-border px-3 py-[7px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors w-64"
          />
          <button
            type="submit"
            className="px-4 py-[7px] bg-surface border border-border text-chalk-2 text-sm hover:border-border-hi transition-colors"
          >
            Search
          </button>
          {q && (
            <a href={href({ q: "", page: "1" })} className="px-3 py-[7px] text-sm text-chalk-3 hover:text-chalk">
              ✕
            </a>
          )}
        </form>

        <div className="flex gap-1 ml-auto">
          {FILTERS.map((f) => (
            <a
              key={f.value}
              href={href({ filter: f.value, page: "1" })}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                currentFilter === f.value
                  ? "border-acid bg-[rgba(204,255,0,.08)] text-acid"
                  : "border-border text-chalk-3 hover:border-border-hi hover:text-chalk"
              }`}
            >
              {f.label}
              {f.value === "low_stock" && summary.lowStock > 0 && (
                <span className="ml-1.5 bg-amber-500/20 text-amber-400 px-1 rounded-sm">{summary.lowStock}</span>
              )}
              {f.value === "out_of_stock" && summary.outOfStock > 0 && (
                <span className="ml-1.5 bg-red-500/20 text-red-400 px-1 rounded-sm">{summary.outOfStock}</span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-surface border border-border p-16 text-center">
          <p className="text-chalk-3">No products found</p>
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Product", "SKU", "Category", "Stock", "Threshold", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-void-3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-chalk">{row.name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-chalk-3">{row.sku}</td>
                  <td className="px-4 py-3 text-xs text-chalk-3">{row.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 w-40">
                    <StockBar qty={row.stockQuantity} threshold={row.lowStockThreshold} />
                  </td>
                  <td className="px-4 py-3 text-xs text-chalk-3">{row.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {row.status === "out_of_stock" && (
                      <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 bg-red-500/15 text-red-400">
                        Out of Stock
                      </span>
                    )}
                    {row.status === "low_stock" && (
                      <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 bg-amber-500/15 text-amber-400">
                        Low Stock
                      </span>
                    )}
                    {row.status === "in_stock" && (
                      <span className="text-[11px] font-semibold text-chalk-3">In Stock</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inventory/${row.id}`}
                      className="text-xs text-acid hover:underline font-semibold"
                    >
                      Adjust →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-chalk-3">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            {page > 1 && (
              <a href={href({ page: String(page - 1) })} className="px-3 py-1.5 border border-border text-chalk-2 text-xs hover:border-border-hi transition-colors">
                ← Prev
              </a>
            )}
            {page < totalPages && (
              <a href={href({ page: String(page + 1) })} className="px-3 py-1.5 border border-border text-chalk-2 text-xs hover:border-border-hi transition-colors">
                Next →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
