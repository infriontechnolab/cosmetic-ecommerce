import { listReturnRequests } from "@/db/queries/returns"
import Link from "next/link"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { FilterTabs } from "@/components/admin/FilterTabs"
import { Pagination } from "@/components/admin/Pagination"

export const metadata = { title: "Returns — Admin" }

const STATUS_OPTIONS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "received", label: "Received" },
  { value: "refunded", label: "Refunded" },
  { value: "rejected", label: "Rejected" },
]

const REASON_LABEL: Record<string, string> = {
  defective:        "Defective",
  wrong_item:       "Wrong Item",
  not_as_described: "Not as Described",
  damaged:          "Damaged",
  changed_mind:     "Changed Mind",
  other:            "Other",
}

const REFUND_METHOD_LABEL: Record<string, string> = {
  original_payment: "Original Payment",
  store_credit:     "Store Credit",
  replacement:      "Replacement",
}

const fmt = (n: string | number | null) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}` : "—"

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 20
  const currentStatus = status ?? "all"

  const { returns, total, summary } = await listReturnRequests({
    status: currentStatus,
    page,
    perPage,
  })

  const totalPages = Math.ceil(total / perPage)

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({ status: currentStatus, page: String(page), ...overrides })
    return `/admin/returns?${p}`
  }

  const filterOptions = STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    count: opt.value !== "all" ? (summary[opt.value] ?? 0) || undefined : undefined,
  }))

  return (
    <div className="p-8">
      <PageHeader
        title="Returns & Refunds"
        subtitle={`${summary.all ?? 0} total · ${summary.pending ?? 0} pending review`}
      />

      {/* Pending alert */}
      {(summary.pending ?? 0) > 0 && (
        <a
          href={href({ status: "pending", page: "1" })}
          className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-400 hover:bg-yellow-500/15 transition-colors w-fit"
        >
          <span className="font-semibold">
            {summary.pending} return{summary.pending !== 1 ? "s" : ""} awaiting review
          </span>
        </a>
      )}

      {/* Status tabs */}
      <FilterTabs
        options={filterOptions}
        current={currentStatus}
        hrefFn={(val) => href({ status: val, page: "1" })}
        className="mb-5"
      />

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
                {["Return #", "Order", "Customer", "Reason", "Refund Method", "Amount", "Status", "Date", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
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
                  : "—"

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
                    <td className="px-4 py-3 font-bold text-sm text-chalk">{fmt(ret.refundAmount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ret.status} type="return" />
                    </td>
                    <td className="px-4 py-3 text-xs text-chalk-3 whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/returns/${ret.id}`}
                        className="text-xs text-acid hover:underline font-semibold"
                      >
                        Review →
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
