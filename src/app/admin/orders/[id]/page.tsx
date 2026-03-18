import { getAdminOrderById } from "@/db/queries/admin-orders";
import { notFound } from "next/navigation";
import Link from "next/link";
import OrderUpdateForm from "./_components/OrderUpdateForm";

export const metadata = { title: "Order Detail — Admin" };

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const fmtDate = (d: Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  processing: "bg-purple-500/15 text-purple-400",
  shipped: "bg-cyan-500/15 text-cyan-400",
  delivered: "bg-[rgba(204,255,0,.12)] text-acid",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-white/5 text-chalk-3",
};

const PAY_COLOR: Record<string, string> = {
  completed: "text-acid",
  pending: "text-yellow-400",
  failed: "text-red-400",
  processing: "text-blue-400",
  refunded: "text-chalk-3",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const order = await getAdminOrderById(orderId);
  if (!order) notFound();

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount ?? 0);
  const tax = Number(order.taxAmount);
  const shipping = Number(order.shippingAmount ?? 0);
  const total = Number(order.totalAmount);

  return (
    <div className="p-8">
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <div className="text-xs text-chalk-3 mb-2">
          <Link href="/admin/orders" className="hover:text-acid transition-colors">
            Orders
          </Link>
          {" / "}#{order.orderNumber}
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-chalk tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-chalk-3 mt-1">Placed {fmtDate(order.createdAt)}</p>
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 ${STATUS_BADGE[order.status] ?? "bg-white/5 text-chalk-3"}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Customer */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Customer
            </h3>
            <div className="text-sm text-chalk-2">
              <div className="font-semibold text-chalk">{order.customerName ?? "—"}</div>
              <div>{order.customerEmail ?? "—"}</div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
              Items ({order.items.length})
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] text-chalk-3 uppercase tracking-wide">
                  <th className="pb-2 text-left font-semibold">Product</th>
                  <th className="pb-2 text-right font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Unit Price</th>
                  <th className="pb-2 text-right font-semibold">Tax</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5">
                      <div className="text-chalk font-medium">{item.productName}</div>
                      <div className="text-chalk-3 text-[11px] font-mono">{item.productSku}</div>
                    </td>
                    <td className="py-2.5 text-right text-chalk-2">{item.quantity}</td>
                    <td className="py-2.5 text-right text-chalk-2">{fmt(item.unitPrice)}</td>
                    <td className="py-2.5 text-right text-chalk-3">{fmt(item.taxAmount)}</td>
                    <td className="py-2.5 text-right font-bold text-chalk">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price breakdown */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
              Financials
            </h3>
            <div className="flex flex-col gap-2 text-sm max-w-[260px] ml-auto">
              <div className="flex justify-between text-chalk-2">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-acid">
                  <span>Discount</span><span>−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-chalk-2">
                <span>GST (18%)</span><span>{fmt(tax)}</span>
              </div>
              <div className="flex justify-between text-chalk-2">
                <span>Shipping</span><span>{shipping === 0 ? "Free" : fmt(shipping)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-1 flex justify-between font-bold text-chalk text-base">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>

            <div className="border-t border-border mt-4 pt-4 flex gap-6 text-xs">
              <div>
                <span className="text-chalk-3">Payment:</span>{" "}
                <span className="text-chalk font-semibold">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
                </span>
              </div>
              <div>
                <span className="text-chalk-3">Status:</span>{" "}
                <span className={`font-semibold ${PAY_COLOR[order.paymentStatus] ?? "text-chalk"}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Shipping Address
            </h3>
            <address className="not-italic text-sm text-chalk-2 leading-relaxed">
              <div className="font-semibold text-chalk">{order.shippingFullName}</div>
              <div>{order.shippingPhone}</div>
              <div>{order.shippingAddressLine1}</div>
              {order.shippingAddressLine2 && <div>{order.shippingAddressLine2}</div>}
              <div>
                {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
              </div>
              <div>{order.shippingCountry}</div>
            </address>
          </div>

          {/* Admin notes display */}
          {order.adminNotes && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-[0.06em] mb-1">
                Admin Notes
              </div>
              <p className="text-sm text-chalk-2">{order.adminNotes}</p>
            </div>
          )}

          {/* Customer notes */}
          {order.customerNotes && (
            <div className="bg-surface border border-border p-4">
              <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                Customer Notes
              </div>
              <p className="text-sm text-chalk-2">{order.customerNotes}</p>
            </div>
          )}

          {/* Cancellation */}
          {order.cancellationReason && (
            <div className="bg-red-500/10 border border-red-500/20 p-4">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-[0.06em] mb-1">
                Cancellation Reason
              </div>
              <p className="text-sm text-chalk-2">{order.cancellationReason}</p>
              {order.cancelledAt && (
                <p className="text-xs text-chalk-3 mt-1">
                  Cancelled at {fmtDate(order.cancelledAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right — update panel */}
        <div className="flex flex-col gap-5">
          <OrderUpdateForm
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={order.trackingNumber}
            currentCourier={order.courierPartner}
            currentAdminNotes={order.adminNotes}
          />

          {/* Timeline summary */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Timeline
            </h3>
            <div className="flex flex-col gap-2 text-xs text-chalk-3">
              <div className="flex justify-between">
                <span>Placed</span>
                <span className="text-chalk-2">{fmtDate(order.createdAt)}</span>
              </div>
              {order.shippedAt && (
                <div className="flex justify-between">
                  <span>Shipped</span>
                  <span className="text-chalk-2">{fmtDate(order.shippedAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span>Delivered</span>
                  <span className="text-acid">{fmtDate(order.deliveredAt)}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span>Cancelled</span>
                  <span className="text-red-400">{fmtDate(order.cancelledAt)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 mt-1">
                <span>Last updated</span>
                <span className="text-chalk-2">{fmtDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
