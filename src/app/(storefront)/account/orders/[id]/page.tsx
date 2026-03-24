import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getUserOrderById } from "@/db/queries/user-orders";
import { getReturnForOrder } from "@/db/queries/returns";
import Link from "next/link";
import CancelOrderButton from "./_components/CancelOrderButton";
import ReturnRequestForm from "./_components/ReturnRequestForm";

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (d: Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered: "bg-[rgba(204,255,0,.12)] text-acid border-acid/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  refunded: "bg-white/5 text-chalk-3 border-border",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// Ordered steps for the progress timeline (happy path)
const TIMELINE_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function StatusTimeline({ status }: { status: OrderStatus }) {
  const isCancelled = status === "cancelled" || status === "refunded";
  const currentIdx = TIMELINE_STEPS.indexOf(status);

  if (isCancelled) {
    return (
      <div className="bg-surface border border-border p-6">
        <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
          Order Status
        </h3>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20">
          <span className="text-red-400">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-6 h-6"><circle cx="12" cy="12" r="9" strokeLinecap="round"/><line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/></svg>
          </span>
          <div>
            <div className="text-sm font-bold text-red-400">
              {STATUS_LABEL[status]}
            </div>
            <div className="text-xs text-chalk-3 mt-0.5">
              This order has been {status}.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border p-6">
      <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-5">
        Order Progress
      </h3>
      <div className="flex items-center gap-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const isLast = idx === TIMELINE_STEPS.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center border-2 text-xs font-bold transition-all ${
                    active
                      ? "border-acid bg-[rgba(204,255,0,.12)] text-acid"
                      : done
                      ? "border-acid bg-acid text-void"
                      : "border-border bg-void text-chalk-3"
                  }`}
                >
                  {done && !active ? "✓" : idx + 1}
                </div>
                <div
                  className={`text-[10px] font-semibold mt-2 text-center leading-tight max-w-[64px] ${
                    active ? "text-acid" : done ? "text-chalk-2" : "text-chalk-3"
                  }`}
                >
                  {STATUS_LABEL[step]}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-px mt-[-18px] transition-all ${
                    idx < currentIdx ? "bg-acid" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account/orders");

  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const [order, existingReturn] = await Promise.all([
    getUserOrderById(Number(session.user.id), orderId),
    getReturnForOrder(orderId, Number(session.user.id)),
  ]);
  if (!order) notFound();

  const canCancel =
    order.status === "pending" || order.status === "confirmed";

  const canReturn = order.status === "delivered";

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount ?? 0);
  const tax = Number(order.taxAmount);
  const shipping = Number(order.shippingAmount ?? 0);
  const total = Number(order.totalAmount);

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link>
            {" / "}
            <Link href="/account" className="hover:text-acid transition-colors">Account</Link>
            {" / "}
            <Link href="/account/orders" className="hover:text-acid transition-colors">Orders</Link>
            {" / "}
            #{order.orderNumber}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
                Order <span className="text-acid">#{order.orderNumber}</span>
              </h1>
              <p className="text-sm text-chalk-3 mt-1">
                Placed on {fmtDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`text-[11px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 border ${STATUS_COLOR[order.status] ?? "bg-white/5 text-chalk-3 border-border"}`}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-[1fr_340px] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Timeline */}
          <StatusTimeline status={order.status as OrderStatus} />

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-surface border border-border p-5">
              <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
                Shipment Tracking
              </h3>
              <div className="flex items-center gap-3">
                <span style={{ color: 'var(--color-terracotta)' }}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-6 h-6"><rect x="1" y="3" width="15" height="13" rx="1" strokeLinecap="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>
                </span>
                <div>
                  {order.courierPartner && (
                    <div className="text-xs text-chalk-3 mb-0.5">
                      {order.courierPartner}
                    </div>
                  )}
                  <div className="text-sm font-bold text-chalk font-mono">
                    {order.trackingNumber}
                  </div>
                  {order.shippedAt && (
                    <div className="text-xs text-chalk-3 mt-0.5">
                      Shipped {fmtDate(order.shippedAt)}
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="text-xs text-acid font-semibold mt-0.5">
                      Delivered {fmtDate(order.deliveredAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
              Items Ordered
            </h3>
            <div className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-chalk truncate">
                      {item.productName}
                    </div>
                    <div className="text-xs text-chalk-3 mt-0.5">
                      SKU: {item.productSku} · Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-chalk ml-4">
                    {fmt(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation reason */}
          {order.cancellationReason && (
            <div className="bg-red-500/10 border border-red-500/20 p-4">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-[0.06em] mb-1">
                Cancellation Reason
              </div>
              <div className="text-sm text-chalk-2">{order.cancellationReason}</div>
            </div>
          )}

          {/* Cancel button */}
          {canCancel && (
            <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} />
          )}

          {canReturn && (
            <ReturnRequestForm
              orderId={order.id}
              paymentMethod={order.paymentMethod}
              existingReturn={existingReturn}
            />
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Order summary */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
              Order Summary
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-chalk-2">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-acid">
                  <span>Discount</span>
                  <span>−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-chalk-2">
                <span>GST (18%)</span>
                <span>{fmt(tax)}</span>
              </div>
              <div className="flex justify-between text-chalk-2">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : fmt(shipping)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-1 flex justify-between text-chalk font-bold text-base">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 text-xs text-chalk-3">
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="text-chalk-2 font-semibold">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Razorpay"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment status</span>
                <span
                  className={`font-semibold ${
                    order.paymentStatus === "completed"
                      ? "text-acid"
                      : order.paymentStatus === "failed"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Shipping Address
            </h3>
            <div className="text-sm text-chalk-2 leading-relaxed">
              <div className="font-semibold text-chalk">{order.shippingFullName}</div>
              <div>{order.shippingPhone}</div>
              <div>{order.shippingAddressLine1}</div>
              {order.shippingAddressLine2 && (
                <div>{order.shippingAddressLine2}</div>
              )}
              <div>
                {order.shippingCity}, {order.shippingState} {order.shippingPincode}
              </div>
              <div>{order.shippingCountry}</div>
            </div>
          </div>

          {order.customerNotes && (
            <div className="bg-surface border border-border p-5">
              <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-2">
                Order Notes
              </h3>
              <p className="text-sm text-chalk-2">{order.customerNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
