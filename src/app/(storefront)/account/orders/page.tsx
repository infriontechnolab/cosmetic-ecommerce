import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserOrders, type OrderListItem } from "@/db/queries/user-orders";
import Link from "next/link";

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered: "bg-[rgba(204,255,0,.12)] text-acid border-acid/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  refunded: "bg-white/5 text-chalk-3 border-border",
};

const PAY_LABEL: Record<string, string> = {
  razorpay: "Razorpay",
  cod: "Cash on Delivery",
};

function OrderCard({ order }: { order: OrderListItem }) {
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block bg-surface border border-border hover:border-border-hi transition-colors p-5 group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
            Order #{order.orderNumber}
          </div>
          <div className="text-xs text-chalk-3">{date}</div>
        </div>
        <span
          className={`text-[11px] font-bold uppercase tracking-[0.06em] px-2.5 py-1 border ${STATUS_COLOR[order.status] ?? "bg-white/5 text-chalk-3 border-border"}`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-chalk-3">
          <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
        </div>
        <div className="text-base font-extrabold text-chalk font-display">
          {fmt(order.totalAmount)}
        </div>
      </div>

      <div className="mt-3 text-xs text-acid font-semibold group-hover:underline">
        View details →
      </div>
    </Link>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/orders");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const perPage = 10;

  const { orders, total } = await getUserOrders(Number(session.user.id), {
    page,
    perPage,
  });

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link>
            {" / "}
            <Link href="/account" className="hover:text-acid transition-colors">Account</Link>
            {" / "}
            Orders
          </div>
          <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
            My <span className="text-acid">Orders</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="bg-surface border border-border p-16 text-center">
            <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8L12 3L3 8V16L12 21L21 16V8Z"/><path strokeLinecap="round" d="M3 8L12 13L21 8"/><line x1="12" y1="13" x2="12" y2="21" strokeLinecap="round"/></svg>
            </div>
            <p className="text-chalk-2 font-semibold mb-1">No orders yet</p>
            <p className="text-chalk-3 text-sm mb-6">
              Your order history will appear here
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-chalk-3">
                {total} order{total !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/account/orders?page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center text-sm font-bold border transition-colors ${
                      p === page
                        ? "border-acid bg-[rgba(204,255,0,.08)] text-acid"
                        : "border-border text-chalk-3 hover:border-border-hi hover:text-chalk"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
