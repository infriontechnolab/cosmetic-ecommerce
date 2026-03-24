'use client'
import { useState, useEffect } from 'react'

function getTimeUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = Math.max(0, midnight.getTime() - now.getTime())
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

export function CountdownTimer() {
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    setTime(getTimeUntilMidnight())
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'H', value: time?.h ?? 0 },
    { label: 'M', value: time?.m ?? 0 },
    { label: 'S', value: time?.s ?? 0 },
  ]

  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em] mr-1">Ends in</span>
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-[6px]">
          {i > 0 && <span className="text-chalk-3 font-bold text-sm leading-none mb-[2px]">:</span>}
          <div className="flex flex-col items-center bg-chalk text-void min-w-[34px] px-[6px] py-[4px]">
            <span className="text-[14px] font-extrabold font-display leading-none tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-void/50 mt-[2px]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
