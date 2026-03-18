'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import brandsData from '@/data/brands.json'

const offerCls: Record<string, string> = {
  acid:  'bg-[rgba(204,255,0,.12)] text-acid border border-[rgba(204,255,0,.25)]',
  dim:   'bg-[rgba(204,255,0,.06)] text-chalk-2 border border-border',
  muted: 'bg-void-3 text-chalk-3 border border-border',
}

export default function ShopByBrand() {
  const [activeTab, setActiveTab] = useState(0)
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[52px] bg-void-2">
      <div className="max-w-[1440px] mx-auto px-6">
        <div ref={header.ref} className={`flex items-center justify-between mb-7 reveal ${header.visible ? 'visible' : ''}`}>
          <h2 className="text-[22px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">Shop by <span className="text-acid">Brand</span></h2>
          <div className="flex gap-2 flex-wrap">
            {brandsData.tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-[6px] text-xs font-semibold border transition-all ${
                  activeTab === i
                    ? 'bg-acid text-void border-acid'
                    : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk-2'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div ref={grid.ref} className={`flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 reveal ${grid.visible ? 'visible' : ''}`}>
          {brandsData.items.map(brand => (
            <Link
              key={brand.name}
              href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="min-w-[160px] bg-surface border border-border p-[18px_16px] flex flex-col gap-2 cursor-pointer hover:border-border-hi hover:-translate-y-0.5 transition-all flex-shrink-0 group"
            >
              <div className="text-[15px] font-bold text-chalk group-hover:text-acid transition-colors">{brand.name}</div>
              <span className={`inline-flex items-center px-2 py-[3px] text-[11px] font-semibold w-fit ${offerCls[brand.type]}`}>{brand.offer}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
