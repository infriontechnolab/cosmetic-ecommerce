import { listAdminOrders } from "@/db/queries/admin-orders";
import Link from "next/link";

export const metadata = { title: "Orders — Admin" };

const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  processing: "bg-purple-500/15 text-purple-400",
  shipped: "bg-cyan-500/15 text-cyan-400",
  delivered: "bg-[rgba(204,255,0,.12)] text-acid",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-white/5 text-chalk-3",
};

const PAY_BADGE: Record<string, string> = {
  completed: "text-acid",
  pending: "text-yellow-400",
  failed: "text-red-400",
  processing: "text-blue-400",
  refunded: "text-chalk-3",
};

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const perPage = 20;

  const { orders, total } = await listAdminOrders({
    search: q,
    status: status ?? "all",
    page,
    perPage,
  });

  const totalPages = Math.ceil(total / perPage);
  const currentStatus = status ?? "all";

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({ ...(q ? { q } : {}), status: currentStatus, page: String(page), ...overrides });
    return `/admin/orders?${p}`;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Orders</h1>
          <p className="text-sm text-chalk-3 mt-1">{total} order{total !== 1 ? "s" : ""} total</p>
        </div>
        <a
          href={`/api/admin/orders/export?status=${currentStatus}`}
          className="px-4 py-2 border border-border text-chalk-2 text-sm font-medium hover:border-border-hi transition-colors flex items-center gap-2"
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5">
        {/* Search */}
        <form method="GET" action="/admin/orders" className="flex gap-2">
          {currentStatus !== "all" && (
            <input type="hidden" name="status" value={currentStatus} />
          )}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search order #, name, email…"
            className="bg-surface border border-border px-3 py-[7px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors w-72"
          />
          <button
            type="submit"
            className="px-4 py-[7px] bg-surface border border-border text-chalk-2 text-sm hover:border-border-hi transition-colors"
          >
            Search
          </button>
          {q && (
            <a href={href({ q: "", page: "1" })} className="px-3 py-[7px] text-sm text-chalk-3 hover:text-chalk">
              ✕ Clear
            </a>
          )}
        </form>

        {/* Status tabs */}
        <div className="flex gap-1 ml-auto">
          {STATUS_OPTIONS.map((opt) => (
            <a
              key={opt.value}
              href={href({ status: opt.value, page: "1" })}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                currentStatus === opt.value
                  ? "border-acid bg-[rgba(204,255,0,.08)] text-acid"
                  : "border-border text-chalk-3 hover:border-border-hi hover:text-chalk"
              }`}
            >
              {opt.label}
            </a>
          ))}
        </div>
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
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">
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
                  : "—";

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
                      <div className="text-chalk-3 text-[11px]">{order.shippingCity}, {order.shippingState}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 ${STATUS_BADGE[order.status] ?? "bg-white/5 text-chalk-3"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-[11px] font-semibold ${PAY_BADGE[order.paymentStatus] ?? "text-chalk-3"}`}>
                        {order.paymentStatus}
                      </div>
                      <div className="text-[11px] text-chalk-3">{order.paymentMethod === "cod" ? "COD" : "Razorpay"}</div>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-chalk-3">
            Page {page} of {totalPages}
          </p>
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
