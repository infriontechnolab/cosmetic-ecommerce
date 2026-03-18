'use client'
import type { RevenueByDay } from "@/db/queries/admin-analytics"

const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`

function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export default function RevenueChart({ data }: { data: RevenueByDay[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-chalk-3 text-sm">
        No data for this period
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  // Show at most 30 bars; if more days, compress
  const show = data.length <= 30 ? data : data.filter((_, i) => i % Math.ceil(data.length / 30) === 0)

  return (
    <div className="flex flex-col gap-3">
      {/* Y-axis labels + bars */}
      <div className="flex gap-2 items-end h-40">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-full text-[10px] text-chalk-3 text-right pr-1 shrink-0 w-12">
          <span>{fmt(maxRevenue)}</span>
          <span>{fmt(maxRevenue / 2)}</span>
          <span>₹0</span>
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end gap-px h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-t border-white/5 w-full" />
            ))}
          </div>
          {show.map((day) => {
            const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
            const hasRevenue = day.revenue > 0
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col justify-end group relative"
                style={{ height: "100%" }}
              >
                <div
                  className={`w-full transition-all duration-300 ${hasRevenue ? "bg-acid hover:bg-acid-dim" : "bg-white/5"}`}
                  style={{ height: `${Math.max(pct, hasRevenue ? 2 : 0)}%` }}
                />
                {/* Tooltip */}
                {hasRevenue && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-void border border-border px-2 py-1 text-[10px] text-chalk whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-bold">{fmt(day.revenue)}</div>
                    <div className="text-chalk-3">{day.orders} order{day.orders !== 1 ? "s" : ""}</div>
                    <div className="text-chalk-3">{shortDate(day.date)}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* X-axis: show ~6 date labels evenly */}
      <div className="flex gap-px pl-14">
        {show.map((day, i) => {
          const step = Math.floor(show.length / 5)
          const showLabel = step === 0 || i % step === 0 || i === show.length - 1
          return (
            <div key={day.date} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[10px] text-chalk-3">{shortDate(day.date)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
