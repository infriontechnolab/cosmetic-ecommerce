'use client'

const STATUS_COLOR: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  processing: "#a855f7",
  shipped: "#06b6d4",
  delivered: "#ccff00",
  cancelled: "#ef4444",
  refunded: "#6b7280",
}

export default function DonutChart({
  data,
}: {
  data: Record<string, number>
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + v, 0)

  if (total === 0) {
    return <div className="py-6 text-center text-chalk-3 text-sm">No orders in this period</div>
  }

  // Build SVG donut via conic gradient approximation using stroke-dasharray
  let offset = 0
  const RADIUS = 40
  const CIRC = 2 * Math.PI * RADIUS

  const segments = entries.map(([key, val]) => {
    const pct = val / total
    const dash = pct * CIRC
    const seg = { key, val, pct, dash, offset }
    offset += dash
    return seg
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#ffffff0d" strokeWidth="14" />
        {segments.map((seg) => (
          <circle
            key={seg.key}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={STATUS_COLOR[seg.key] ?? "#6b7280"}
            strokeWidth="14"
            strokeDasharray={`${seg.dash} ${CIRC - seg.dash}`}
            strokeDashoffset={CIRC / 4 - seg.offset}
            strokeLinecap="butt"
          />
        ))}
        <text x="50" y="46" textAnchor="middle" className="fill-current" fontSize="13" fontWeight="bold" fill="#f0f0f0">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#888">
          orders
        </text>
      </svg>

      <div className="flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: STATUS_COLOR[seg.key] ?? "#6b7280" }}
            />
            <span className="text-xs text-chalk-2 capitalize">{seg.key}</span>
            <span className="text-xs text-chalk-3 ml-auto pl-3">{seg.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
