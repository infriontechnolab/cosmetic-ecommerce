import { getInventoryDetail } from "@/db/queries/admin-inventory"
import { notFound } from "next/navigation"
import Link from "next/link"
import StockAdjustForm from "./_components/StockAdjustForm"
import { InfoCard } from "@/components/admin/InfoCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata = { title: "Inventory Detail — Admin" }

const CHANGE_COLOR: Record<string, string> = {
  purchase:   "text-acid",
  return:     "text-acid",
  adjustment: "text-blue-400",
  sale:       "text-chalk-3",
  damage:     "text-red-400",
  expired:    "text-red-400",
}

const CHANGE_LABEL: Record<string, string> = {
  purchase:   "Purchase",
  return:     "Return",
  adjustment: "Adjustment",
  sale:       "Sale",
  damage:     "Damage",
  expired:    "Expired",
}

const fmtDate = (d: Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = await params
  const productId = Number(id)
  if (isNaN(productId)) notFound()

  const { product, logs } = await getInventoryDetail(productId)
  if (!product) notFound()

  const isLow = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold
  const isOut = product.stockQuantity === 0

  return (
    <div className="p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/inventory" className="text-chalk-3 hover:text-acid">Inventory</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-chalk-3" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-chalk">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">{product.name}</h1>
          <p className="text-sm font-mono text-chalk-3 mt-1">{product.sku}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-border text-chalk-3 rounded-none h-7 text-xs">
          <Link href={`/admin/products/${productId}/edit`}>Edit Product</Link>
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left — status + log */}
        <div className="flex flex-col gap-5">
          {/* Stock status cards */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`border p-4 text-center ${
                isOut ? "border-red-500/30 bg-red-500/5"
                : isLow ? "border-amber-500/30 bg-amber-500/5"
                : "border-acid/20 bg-acid/[0.04]"
              }`}
            >
              <div
                className={`text-4xl font-extrabold font-display ${
                  isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-acid"
                }`}
              >
                {product.stockQuantity}
              </div>
              <div className="text-[11px] text-chalk-3 uppercase tracking-wide mt-1">Current Stock</div>
            </div>
            <div className="border border-border p-4 text-center bg-surface">
              <div className="text-4xl font-extrabold font-display text-chalk">
                {product.lowStockThreshold}
              </div>
              <div className="text-[11px] text-chalk-3 uppercase tracking-wide mt-1">Low Stock Alert</div>
            </div>
            <div className="border border-border p-4 text-center bg-surface flex flex-col items-center justify-center">
              <StatusBadge
                status={isOut ? "out_of_stock" : isLow ? "low_stock" : "in_stock"}
                type="inventory"
                className="mt-2"
              />
              <div className="text-[11px] text-chalk-3 uppercase tracking-wide mt-1">Status</div>
            </div>
          </div>

          {/* History table */}
          <InfoCard title={`Inventory History`} contentClassName="p-0">
            <div className="px-5 py-3 border-b border-border flex justify-between">
              <span className="text-xs text-chalk-3">{logs.length} entries</span>
            </div>
            {logs.length === 0 ? (
              <div className="p-10 text-center text-chalk-3 text-sm">
                No adjustments recorded yet
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Type", "Change", "Before", "After", "Reference", "Notes"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-void-3 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-chalk-3 whitespace-nowrap">
                        {fmtDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-semibold ${CHANGE_COLOR[log.changeType] ?? "text-chalk-3"}`}>
                          {CHANGE_LABEL[log.changeType] ?? log.changeType}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-2.5 font-bold text-sm ${
                          log.quantityChange > 0 ? "text-acid" : "text-red-400"
                        }`}
                      >
                        {log.quantityChange > 0 ? "+" : ""}{log.quantityChange}
                      </td>
                      <td className="px-4 py-2.5 text-chalk-3 text-sm">{log.quantityBefore}</td>
                      <td className="px-4 py-2.5 text-chalk font-semibold text-sm">{log.quantityAfter}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-chalk-3">
                        {log.referenceNumber ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-chalk-3 max-w-[160px] truncate">
                        {log.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </InfoCard>
        </div>

        {/* Right — adjust form */}
        <div>
          <StockAdjustForm productId={product.id} currentStock={product.stockQuantity} />
        </div>
      </div>
    </div>
  )
}
