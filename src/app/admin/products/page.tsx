import Link from "next/link"
import { listAdminProducts } from "@/db/queries/admin-products"
import { deleteProduct } from "@/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Pagination } from "@/components/admin/Pagination"
import { DeleteProductButton } from "./_components/DeleteProductButton"

export const metadata = { title: "Products — Admin" }

const PER_PAGE = 20

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const sp = await searchParams
  const search = sp.q ?? ""
  const page = Math.max(1, parseInt(sp.page ?? "1"))

  const { rows, total } = await listAdminProducts({ search, page, perPage: PER_PAGE })
  const totalPages = Math.ceil(total / PER_PAGE)

  const hrefFn = (p: number) => {
    const q = new URLSearchParams({ ...(search && { q: search }), page: String(p) })
    return `/admin/products?${q}`
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Products"
        subtitle={`${total} total`}
        action={
          <Button
            asChild
            className="bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-xs font-bold h-9"
          >
            <Link href="/admin/products/new">+ Add Product</Link>
          </Button>
        }
      />

      {/* Search */}
      <form method="GET" action="/admin/products" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <Input
            name="q"
            defaultValue={search}
            placeholder="Search by name or SKU…"
            className="bg-surface border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-border-hi"
          />
          <Button
            type="submit"
            variant="outline"
            className="border-border text-chalk-2 rounded-none"
          >
            Search
          </Button>
          {search && (
            <Button asChild variant="ghost" className="text-chalk-3 px-3">
              <Link href="/admin/products">✕</Link>
            </Button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold text-chalk-3 uppercase tracking-wider ${
                    h === "Price" || h === "Stock" ? "text-right" : h === "Status" || h === "Actions" ? "text-center" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
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
                        className="w-10 h-10 object-cover border border-border bg-surface"
                      />
                    ) : (
                      <div className="w-10 h-10 border border-border bg-surface flex items-center justify-center text-chalk-3 text-xs">
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
                  <span
                    className={
                      p.stockQuantity === 0
                        ? "text-red-400 font-semibold"
                        : p.stockQuantity <= 10
                        ? "text-amber-400"
                        : "text-chalk"
                    }
                  >
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge
                    status={p.isActive ? "active" : "inactive"}
                    type="product"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-chalk-2 hover:text-acid transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton
                      productId={p.id}
                      productName={p.name}
                      deleteAction={async () => {
                        "use server"
                        await deleteProduct(p.id)
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} hrefFn={hrefFn} />
    </div>
  )
}
