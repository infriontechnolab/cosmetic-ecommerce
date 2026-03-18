'use client'

interface Row {
  label: string
  sublabel?: string
  value: number
  secondary?: string
}

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`

export default function HorizontalBarChart({
  rows,
  valueLabel = "Revenue",
  color = "bg-acid",
}: {
  rows: Row[]
  valueLabel?: string
  color?: string
}) {
  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-chalk-3 text-sm">No data for this period</div>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 text-[11px] text-chalk-3 text-right shrink-0">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-chalk truncate block">{row.label}</span>
                  {row.sublabel && (
                    <span className="text-[11px] font-mono text-chalk-3">{row.sublabel}</span>
                  )}
                </div>
                <div className="text-right ml-3 shrink-0">
                  <div className="text-xs font-bold text-chalk">{fmt(row.value)}</div>
                  {row.secondary && (
                    <div className="text-[11px] text-chalk-3">{row.secondary}</div>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-white/5 w-full">
                <div
                  className={`h-full ${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
