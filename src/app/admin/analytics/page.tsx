import {
  presetDates,
  getSummaryStats,
  getRevenueByDay,
  getTopProducts,
  getRevenueByCategory,
  getOrderStatusBreakdown,
} from "@/db/queries/admin-analytics"
import RevenueChart from "./_components/RevenueChart"
import HorizontalBarChart from "./_components/HorizontalBarChart"
import DonutChart from "./_components/DonutChart"
import { StatCard } from "@/components/admin/StatCard"
import { FilterTabs } from "@/components/admin/FilterTabs"
import { PageHeader } from "@/components/admin/PageHeader"

export const metadata = { title: "Analytics — Admin" }

const PRESETS = [
  { value: "7d",         label: "Last 7 days" },
  { value: "30d",        label: "Last 30 days" },
  { value: "90d",        label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
]

const fmtCurrency = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const fmtCompact = (n: number) =>
  n >= 10_00_000
    ? `₹${(n / 10_00_000).toFixed(2)}Cr`
    : n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(2)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>
}) {
  const { preset }   = await searchParams
  const currentPreset = preset ?? "30d"
  const { from, to } = presetDates(currentPreset)

  const [summary, revenueByDay, topProducts, byCategory, statusBreakdown] =
    await Promise.all([
      getSummaryStats(from, to),
      getRevenueByDay(from, to),
      getTopProducts(from, to, 10),
      getRevenueByCategory(from, to),
      getOrderStatusBreakdown(from, to),
    ])

  return (
    <div className="p-8">
      <PageHeader
        title="Analytics"
        subtitle={`${from.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} — ${to.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
        action={
          <FilterTabs
            options={PRESETS}
            current={currentPreset}
            hrefFn={(val) => `/admin/analytics?preset=${val}`}
          />
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={fmtCompact(summary.totalRevenue)}
          title={fmtCurrency(summary.totalRevenue)}
          color="text-acid"
        />
        <StatCard
          label="Orders"
          value={summary.totalOrders}
          title={`${summary.totalOrders} paid orders`}
          color="text-chalk"
        />
        <StatCard
          label="Avg Order Value"
          value={fmtCompact(summary.avgOrderValue)}
          title={fmtCurrency(summary.avgOrderValue)}
          color="text-chalk"
        />
        <StatCard
          label="Items Sold"
          value={summary.totalItems}
          title={`${summary.totalItems} units`}
          color="text-chalk"
        />
      </div>

      {/* Revenue chart — untouched */}
      <div className="bg-surface border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-chalk">Revenue Over Time</h2>
          <span className="text-xs text-chalk-3">Paid orders only</span>
        </div>
        <RevenueChart data={revenueByDay} />
      </div>

      {/* Two-column charts — untouched */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Top Products by Revenue</h2>
          <HorizontalBarChart
            rows={topProducts.map((p) => ({
              label:     p.productName,
              sublabel:  p.sku,
              value:     p.totalRevenue,
              secondary: `${p.totalQty} sold`,
            }))}
          />
        </div>
        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Revenue by Category</h2>
          <HorizontalBarChart
            rows={byCategory.map((c) => ({
              label:     c.categoryName,
              value:     c.totalRevenue,
              secondary: `${c.totalOrders} orders`,
            }))}
            color="bg-blue-400"
          />
        </div>
      </div>

      {/* Order status donut — untouched */}
      <div className="bg-surface border border-border p-6">
        <h2 className="text-sm font-semibold text-chalk mb-5">Order Status Breakdown</h2>
        <DonutChart data={statusBreakdown} />
      </div>
    </div>
  )
}
