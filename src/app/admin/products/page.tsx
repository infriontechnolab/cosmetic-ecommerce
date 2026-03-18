import Link from "next/link";
import { listAdminProducts } from "@/db/queries/admin-products";
import { deleteProduct } from "@/lib/admin-actions";

export const metadata = { title: "Products — Admin" };

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.q ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const { rows, total } = await listAdminProducts({ search, page, perPage: PER_PAGE });
  const totalPages = Math.ceil(total / PER_PAGE);

  const href = (overrides: Record<string, string>) => {
    const q = new URLSearchParams({ ...(search && { q: search }), page: String(page), ...overrides });
    return `/admin/products?${q}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Products</h1>
          <p className="text-sm text-chalk-3 mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-acid text-void text-sm font-bold rounded hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
        >
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/products" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <input
            name="q"
            defaultValue={search}
            placeholder="Search by name or SKU…"
            className="flex-1 px-4 py-2 bg-surface border border-border rounded text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-border-hi"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-surface border border-border text-chalk-2 text-sm rounded hover:border-border-hi transition-colors"
          >
            Search
          </button>
          {search && (
            <Link
              href="/admin/products"
              className="px-3 py-2 text-chalk-3 text-sm hover:text-chalk"
            >
              ✕
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left text-xs font-semibold text-chalk-3 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-chalk-3 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-chalk-3 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-chalk-3 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-chalk-3 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-chalk-3 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-chalk-3 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-chalk-3">
                  {search ? `No products matching "${search}"` : "No products yet."}
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.primaryImage}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded border border-border bg-surface"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border border-border bg-surface flex items-center justify-center text-chalk-3 text-xs">
                        —
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-chalk">{p.name}</p>
                      {p.brandName && <p className="text-xs text-chalk-3">{p.brandName}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-chalk-3">{p.sku}</td>
                <td className="px-4 py-3 text-chalk-2">{p.categoryName}</td>
                <td className="px-4 py-3 text-right font-medium text-chalk">
                  ₹{Number(p.price).toLocaleString("en-IN")}
                  {p.salePrice && (
                    <span className="text-xs text-acid ml-1">
                      / ₹{Number(p.salePrice).toLocaleString("en-IN")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={p.stockQuantity === 0 ? "text-red-400 font-semibold" : p.stockQuantity <= 10 ? "text-amber-400" : "text-chalk"}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      p.isActive
                        ? "bg-acid/10 text-acid border border-acid/20"
                        : "bg-white/5 text-chalk-3 border border-border"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-chalk-2 hover:text-acid transition-colors"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteProduct(p.id);
                      }}
                      onSubmit={(e) => {
                        if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-chalk-3 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={href({ page: String(page - 1) })} className="px-3 py-1.5 border border-border text-chalk-3 text-sm hover:border-acid hover:text-acid transition-all rounded">
              ← Prev
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ page: String(n) })}
              className={`w-9 h-9 flex items-center justify-center text-sm border rounded transition-all ${
                n === page
                  ? "border-acid text-acid bg-acid/5"
                  : "border-border text-chalk-3 hover:border-border-hi"
              }`}
            >
              {n}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={href({ page: String(page + 1) })} className="px-3 py-1.5 border border-border text-chalk-3 text-sm hover:border-acid hover:text-acid transition-all rounded">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
