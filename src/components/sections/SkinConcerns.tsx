'use client'
import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import concerns from '@/data/skin-concerns.json'

export default function SkinConcerns() {
  const [active, setActive] = useState(0)
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[52px] bg-void">
      <div className="max-w-[1440px] mx-auto px-6">
        <div ref={header.ref} className={`flex items-center justify-between mb-7 reveal ${header.visible ? 'visible' : ''}`}>
          <h2 className="text-[22px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">Shop by <span className="text-acid">Skin Concern</span></h2>
          <a href="#" className="flex items-center gap-[6px] text-[13px] font-semibold text-acid hover:gap-[10px] transition-all uppercase tracking-[0.04em]">
            View All <svg className="w-[14px] h-[14px] stroke-acid" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div ref={grid.ref} className={`grid grid-cols-6 gap-3 reveal ${grid.visible ? 'visible' : ''}`}>
          {concerns.map((c, i) => (
            <div
              key={c.label}
              onClick={() => setActive(i)}
              className={`bg-surface border p-[20px_14px] cursor-pointer transition-all hover:-translate-y-[3px] relative overflow-hidden ${
                active === i
                  ? 'border-acid shadow-[0_4px_24px_rgba(204,255,0,.1)] -translate-y-[3px]'
                  : 'border-border hover:border-border-hi'
              }`}
            >
              {/* Oversized index number as design element */}
              <div className={`absolute top-2 right-3 text-[52px] font-extrabold leading-none font-display select-none transition-colors ${
                active === i ? 'text-acid/15' : 'text-chalk/5'
              }`}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className={`text-[13px] font-bold transition-colors ${active === i ? 'text-acid' : 'text-chalk'}`}>{c.label}</div>
              <div className="text-[11px] text-chalk-3 mt-[3px]">{c.count}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
