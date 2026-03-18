import { listReturnRequests } from "@/db/queries/returns";
import Link from "next/link";

export const metadata = { title: "Returns — Admin" };

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "received", label: "Received" },
  { value: "refunded", label: "Refunded" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-blue-500/15 text-blue-400",
  received: "bg-purple-500/15 text-purple-400",
  refunded: "bg-[rgba(204,255,0,.12)] text-acid",
  rejected: "bg-red-500/15 text-red-400",
};

const REASON_LABEL: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong Item",
  not_as_described: "Not as Described",
  damaged: "Damaged",
  changed_mind: "Changed Mind",
  other: "Other",
};

const REFUND_METHOD_LABEL: Record<string, string> = {
  original_payment: "Original Payment",
  store_credit: "Store Credit",
  replacement: "Replacement",
};

const fmt = (n: string | number | null) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}` : "—";

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const perPage = 20;
  const currentStatus = status ?? "all";

  const { returns, total, summary } = await listReturnRequests({
    status: currentStatus,
    page,
    perPage,
  });

  const totalPages = Math.ceil(total / perPage);

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({ status: currentStatus, page: String(page), ...overrides });
    return `/admin/returns?${p}`;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Returns & Refunds</h1>
          <p className="text-sm text-chalk-3 mt-1">{summary.all ?? 0} total · {summary.pending ?? 0} pending review</p>
        </div>
      </div>

      {/* Alert for pending */}
      {(summary.pending ?? 0) > 0 && (
        <a
          href={href({ status: "pending", page: "1" })}
          className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400 hover:bg-yellow-500/15 transition-colors w-fit"
        >
          <span>⚠️</span>
          <span className="font-semibold">{summary.pending} return{summary.pending !== 1 ? "s" : ""} awaiting review</span>
        </a>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
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
            {opt.value !== "all" && (summary[opt.value] ?? 0) > 0 && (
              <span className="ml-1.5 opacity-70">{summary[opt.value]}</span>
            )}
          </a>
        ))}
      </div>

      {/* Table */}
      {returns.length === 0 ? (
        <div className="bg-surface border border-border p-16 text-center">
          <p className="text-chalk-3">No return requests found</p>
        </div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Return #", "Order", "Customer", "Reason", "Refund Method", "Amount", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {returns.map((ret) => {
                const date = ret.createdAt
                  ? new Date(ret.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={ret.id} className="hover:bg-void-3 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-chalk">
                      {ret.returnNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-chalk-2 font-mono">
                      #{ret.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-chalk font-medium">{ret.customerName ?? "—"}</div>
                      <div className="text-[11px] text-chalk-3">{ret.customerEmail ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-chalk-2">
                      {REASON_LABEL[ret.reason] ?? ret.reason}
                    </td>
                    <td className="px-4 py-3 text-xs text-chalk-3">
                      {ret.refundMethod ? REFUND_METHOD_LABEL[ret.refundMethod] : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-sm text-chalk">
                      {fmt(ret.refundAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 ${STATUS_BADGE[ret.status] ?? "bg-white/5 text-chalk-3"}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-chalk-3 whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/returns/${ret.id}`} className="text-xs text-acid hover:underline font-semibold">
                        Review →
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
