import { getReturnById } from "@/db/queries/returns";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReturnActionPanel from "./_components/ReturnActionPanel";

export const metadata = { title: "Return Detail — Admin" };

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-blue-500/15 text-blue-400",
  received: "bg-purple-500/15 text-purple-400",
  refunded: "bg-[rgba(204,255,0,.12)] text-acid",
  rejected: "bg-red-500/15 text-red-400",
};

const REASON_LABEL: Record<string, string> = {
  defective: "Defective Product",
  wrong_item: "Wrong Item Received",
  not_as_described: "Not as Described",
  damaged: "Damaged in Transit",
  changed_mind: "Changed Mind",
  other: "Other",
};

const REFUND_LABEL: Record<string, string> = {
  original_payment: "Original Payment",
  store_credit: "Store Credit",
  replacement: "Replacement",
};

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

const fmt = (n: string | number | null) =>
  n != null
    ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`
    : "—";

export default async function AdminReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const returnId = Number(id);
  if (isNaN(returnId)) notFound();

  const ret = await getReturnById(returnId);
  if (!ret) notFound();

  const WORKFLOW = [
    { key: "pending", label: "Submitted" },
    { key: "approved", label: "Approved" },
    { key: "received", label: "Item Received" },
    { key: "refunded", label: "Refunded" },
  ];
  const isRejected = ret.status === "rejected";
  const currentStep = WORKFLOW.findIndex((s) => s.key === ret.status);

  return (
    <div className="p-8">
      <div className="text-xs text-chalk-3 mb-4">
        <Link href="/admin/returns" className="hover:text-acid transition-colors">
          Returns
        </Link>
        {" / "}{ret.returnNumber}
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">
            Return {ret.returnNumber}
          </h1>
          <p className="text-sm text-chalk-3 mt-1">
            Filed {fmtDate(ret.createdAt)} · Order{" "}
            <Link href={`/admin/orders/${ret.orderId}`} className="text-acid hover:underline">
              #{ret.orderNumber}
            </Link>
          </p>
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-[0.06em] px-3 py-1.5 ${STATUS_BADGE[ret.status] ?? "bg-white/5 text-chalk-3"}`}>
          {ret.status}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Progress */}
          {!isRejected && (
            <div className="bg-surface border border-border p-5">
              <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-5">
                Progress
              </h3>
              <div className="flex items-center">
                {WORKFLOW.map((step, idx) => {
                  const done = idx <= currentStep;
                  const active = idx === currentStep;
                  const isLast = idx === WORKFLOW.length - 1;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 flex items-center justify-center border-2 text-xs font-bold ${
                          active ? "border-acid bg-[rgba(204,255,0,.12)] text-acid"
                          : done ? "border-acid bg-acid text-void"
                          : "border-border bg-void text-chalk-3"
                        }`}>
                          {done && !active ? "✓" : idx + 1}
                        </div>
                        <div className={`text-[10px] font-semibold mt-1.5 text-center max-w-[64px] leading-tight ${
                          active ? "text-acid" : done ? "text-chalk-2" : "text-chalk-3"
                        }`}>
                          {step.label}
                        </div>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-px mt-[-14px] ${idx < currentStep ? "bg-acid" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Return details */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-4">
              Return Details
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-chalk-3 mb-0.5">Reason</dt>
                <dd className="font-semibold text-chalk">{REASON_LABEL[ret.reason] ?? ret.reason}</dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-3 mb-0.5">Refund Method</dt>
                <dd className="font-semibold text-chalk">{ret.refundMethod ? REFUND_LABEL[ret.refundMethod] : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-3 mb-0.5">Refund Amount</dt>
                <dd className="font-bold text-chalk text-base">{fmt(ret.refundAmount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-3 mb-0.5">Payment Method</dt>
                <dd className="font-semibold text-chalk">
                  {ret.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
                </dd>
              </div>
            </dl>
            {ret.reasonDetails && (
              <div className="mt-4 pt-4 border-t border-border">
                <dt className="text-xs text-chalk-3 mb-1">Customer Details</dt>
                <dd className="text-sm text-chalk-2">{ret.reasonDetails}</dd>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Customer
            </h3>
            <div className="text-sm">
              <div className="font-semibold text-chalk">{ret.customerName ?? "—"}</div>
              <div className="text-chalk-3">{ret.customerEmail ?? "—"}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface border border-border p-5">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
              Timeline
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-chalk-3">Submitted</span>
                <span className="text-chalk-2">{fmtDate(ret.createdAt) ?? "—"}</span>
              </div>
              {ret.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-chalk-3">Approved</span>
                  <span className="text-blue-400">{fmtDate(ret.approvedAt)}</span>
                </div>
              )}
              {ret.rejectedAt && (
                <div className="flex justify-between">
                  <span className="text-chalk-3">Rejected</span>
                  <span className="text-red-400">{fmtDate(ret.rejectedAt)}</span>
                </div>
              )}
              {ret.receivedAt && (
                <div className="flex justify-between">
                  <span className="text-chalk-3">Item Received</span>
                  <span className="text-purple-400">{fmtDate(ret.receivedAt)}</span>
                </div>
              )}
              {ret.refundedAt && (
                <div className="flex justify-between">
                  <span className="text-chalk-3">Refunded</span>
                  <span className="text-acid">{fmtDate(ret.refundedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection reason */}
          {ret.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/20 p-4">
              <div className="text-xs font-semibold text-red-400 uppercase tracking-[0.06em] mb-1">
                Rejection Reason
              </div>
              <p className="text-sm text-chalk-2">{ret.rejectionReason}</p>
            </div>
          )}

          {/* Admin notes */}
          {ret.adminNotes && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-[0.06em] mb-1">
                Admin Notes
              </div>
              <p className="text-sm text-chalk-2">{ret.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right — action panel */}
        <div>
          <ReturnActionPanel
            returnId={ret.id}
            status={ret.status}
            paymentMethod={ret.paymentMethod}
            currentRefundAmount={ret.refundAmount}
            orderTotal={ret.orderTotalAmount}
          />
        </div>
      </div>
    </div>
  );
}
