import {
  presetDates,
  getSummaryStats,
  getRevenueByDay,
  getTopProducts,
  getRevenueByCategory,
  getOrderStatusBreakdown,
} from "@/db/queries/admin-analytics";
import RevenueChart from "./_components/RevenueChart";
import HorizontalBarChart from "./_components/HorizontalBarChart";
import DonutChart from "./_components/DonutChart";
import Link from "next/link";

export const metadata = { title: "Analytics — Admin" };

const PRESETS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
];

const fmtCurrency = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtCompact = (n: number) =>
  n >= 10_00_000
    ? `₹${(n / 10_00_000).toFixed(2)}Cr`
    : n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(2)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const { preset } = await searchParams;
  const currentPreset = preset ?? "30d";
  const { from, to } = presetDates(currentPreset);

  const [summary, revenueByDay, topProducts, byCategory, statusBreakdown] =
    await Promise.all([
      getSummaryStats(from, to),
      getRevenueByDay(from, to),
      getTopProducts(from, to, 10),
      getRevenueByCategory(from, to),
      getOrderStatusBreakdown(from, to),
    ]);

  const statCards = [
    {
      label: "Revenue",
      value: fmtCompact(summary.totalRevenue),
      full: fmtCurrency(summary.totalRevenue),
      color: "text-acid",
    },
    {
      label: "Orders",
      value: String(summary.totalOrders),
      full: `${summary.totalOrders} paid orders`,
      color: "text-chalk",
    },
    {
      label: "Avg Order Value",
      value: fmtCompact(summary.avgOrderValue),
      full: fmtCurrency(summary.avgOrderValue),
      color: "text-chalk",
    },
    {
      label: "Items Sold",
      value: String(summary.totalItems),
      full: `${summary.totalItems} units`,
      color: "text-chalk",
    },
  ];

  return (
    <div className="p-8">
      {/* Header + date filter */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Analytics</h1>
          <p className="text-sm text-chalk-3 mt-1">
            {from.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" — "}
            {to.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <Link
              key={p.value}
              href={`/admin/analytics?preset=${p.value}`}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                currentPreset === p.value
                  ? "border-acid bg-[rgba(204,255,0,.08)] text-acid"
                  : "border-border text-chalk-3 hover:border-border-hi hover:text-chalk"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="bg-surface border border-border p-5">
            <p className="text-xs text-chalk-3 uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-3xl font-extrabold font-display ${c.color}`} title={c.full}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-surface border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-chalk">Revenue Over Time</h2>
          <span className="text-xs text-chalk-3">Paid orders only</span>
        </div>
        <RevenueChart data={revenueByDay} />
      </div>

      {/* Two-column: top products + by category */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top products */}
        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Top Products by Revenue</h2>
          <HorizontalBarChart
            rows={topProducts.map((p) => ({
              label: p.productName,
              sublabel: p.sku,
              value: p.totalRevenue,
              secondary: `${p.totalQty} sold`,
            }))}
          />
        </div>

        {/* By category */}
        <div className="bg-surface border border-border p-6">
          <h2 className="text-sm font-semibold text-chalk mb-5">Revenue by Category</h2>
          <HorizontalBarChart
            rows={byCategory.map((c) => ({
              label: c.categoryName,
              value: c.totalRevenue,
              secondary: `${c.totalOrders} orders`,
            }))}
            color="bg-blue-400"
          />
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="bg-surface border border-border p-6">
        <h2 className="text-sm font-semibold text-chalk mb-5">Order Status Breakdown</h2>
        <DonutChart data={statusBreakdown} />
      </div>
    </div>
  );
}
