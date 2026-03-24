import {
  presetDates,
  getSummaryStats,
  getRevenueByDay,
  getTopProducts,
  getRevenueByCategory,
  getOrderStatusBreakdown,
  getPaymentMethodBreakdown,
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

  const [summary, revenueByDay, topProducts, byCategory, statusBreakdown, paymentBreakdown] =
    await Promise.all([
      getSummaryStats(from, to),
      getRevenueByDay(from, to),
      getTopProducts(from, to, 10),
      getRevenueByCategory(from, to),
      getOrderStatusBreakdown(from, to),
      getPaymentMethodBreakdown(from, to),
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
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard
          label="Revenue"
          value={fmtCompact(summary.totalRevenue)}
          title={fmtCurrency(summary.totalRevenue)}
          color="text-acid"
        />
        <StatCard
          label="Paid Orders"
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
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Items Sold"
          value={summary.totalItems}
          title={`${summary.totalItems} units`}
          color="text-chalk"
        />
        <StatCard
          label="New Customers"
          value={summary.newCustomers}
          title={`${summary.newCustomers} sign-ups in period`}
          color="text-blue-400"
        />
        <StatCard
          label="Returns"
          value={summary.totalReturns}
          title={`${summary.totalReturns} return requests`}
          color={summary.totalReturns > 0 ? "text-red-400" : "text-chalk-3"}
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

      {/* Order status + payment method */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Order Status Breakdown</h2>
          <DonutChart data={statusBreakdown} />
        </div>

        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Payment Method (Paid Orders)</h2>
          {paymentBreakdown.length === 0 ? (
            <div className="py-6 text-center text-chalk-3 text-sm">No paid orders in this period</div>
          ) : (
            <div className="flex flex-col gap-4">
              {paymentBreakdown.map((pm) => {
                const totalRevenue = paymentBreakdown.reduce((s, p) => s + p.revenue, 0)
                const pct = totalRevenue > 0 ? Math.round((pm.revenue / totalRevenue) * 100) : 0
                const label = pm.method === 'razorpay' ? 'Razorpay (Online)' : pm.method === 'cod' ? 'Cash on Delivery' : pm.method
                const barColor = pm.method === 'razorpay' ? 'bg-purple-400' : 'bg-yellow-400'
                return (
                  <div key={pm.method}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-xs font-semibold text-chalk capitalize">{label}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-chalk">{fmtCompact(pm.revenue)}</span>
                        <span className="text-[11px] text-chalk-3 ml-2">{pm.count} order{pm.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 w-full">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-chalk-3 mt-0.5">{pct}% of revenue</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
