import { listAdminOrders } from "@/db/queries/admin-orders"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { FilterTabs } from "@/components/admin/FilterTabs"
import { Pagination } from "@/components/admin/Pagination"

export const metadata = { title: "Orders — Admin" }

const STATUS_OPTIONS = [
  { value: "all",       label: "All Orders" },
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing",label: "Processing" },
  { value: "shipped",   label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded",  label: "Refunded" },
]

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const { q, status, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 20

  const { orders, total } = await listAdminOrders({
    search: q,
    status: status ?? "all",
    page,
    perPage,
  })

  const totalPages = Math.ceil(total / perPage)
  const currentStatus = status ?? "all"

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(q ? { q } : {}),
      status: currentStatus,
      page: String(page),
      ...overrides,
    })
    return `/admin/orders?${p}`
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Orders"
        subtitle={`${total} order${total !== 1 ? "s" : ""} total`}
        action={
          <Button asChild variant="outline" className="border-border text-chalk-2 rounded-none h-9 gap-2">
            <a href={`/api/admin/orders/export?status=${currentStatus}`}>
              ↓ Export CSV
            </a>
          </Button>
        }
      />

      {/* Filters row */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        {/* Search */}
        <form method="GET" action="/admin/orders" className="flex gap-2">
          {currentStatus !== "all" && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search order #, name, email…"
            className="bg-surface border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid w-72"
          />
          <Button
            type="submit"
            variant="outline"
            className="border-border text-chalk-2 rounded-none"
          >
            Search
          </Button>
          {q && (
            <Button asChild variant="ghost" className="text-chalk-3 px-3 rounded-none">
              <a href={href({ q: "", page: "1" })}>✕ Clear</a>
            </Button>
          )}
        </form>

        <FilterTabs
          options={STATUS_OPTIONS}
          current={currentStatus}
          hrefFn={(val) => href({ status: val, page: "1" })}
          className="ml-auto"
        />
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="bg-surface border border-border p-16 text-center">
          <p className="text-chalk-3">No orders found</p>
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Order", "Customer", "Status", "Payment", "Items", "Total", "Date", ""].map((h) => (
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
              {orders.map((order) => {
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"

                return (
                  <tr key={order.id} className="hover:bg-void-3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-chalk font-semibold">
                        #{order.orderNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-chalk text-xs font-medium">{order.customerName ?? "—"}</div>
                      <div className="text-chalk-3 text-[11px]">{order.customerEmail ?? "—"}</div>
                      <div className="text-chalk-3 text-[11px]">
                        {order.shippingCity}, {order.shippingState}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                      <div className="text-[11px] text-chalk-3 mt-1">
                        {order.paymentMethod === "cod" ? "COD" : "Razorpay"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-chalk-2 text-xs">{order.itemCount}</td>
                    <td className="px-4 py-3 font-bold text-chalk text-sm">{fmt(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-chalk-3 text-xs whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-acid hover:underline font-semibold"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefFn={(p) => href({ page: String(p) })}
      />
    </div>
  )
}
