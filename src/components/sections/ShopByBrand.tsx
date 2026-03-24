'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import type { Brand } from '@/types/site'

const offerCls: Record<string, string> = {
  acid:  'bg-[rgba(0,193,112,.18)] text-acid border border-[rgba(0,193,112,.35)]',
  dim:   'bg-white/20 text-white/80 border border-white/20',
  muted: 'bg-white/10 text-white/60 border border-white/15',
}

// Rotating set of luxury beauty images for brand cards
const brandImages = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80&auto=format&fit=crop',
]

export default function ShopByBrand({ initialData }: { initialData: { tabs: string[]; items: Brand[] } }) {
  const [activeTab, setActiveTab] = useState(0)
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[72px] bg-void-2">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div ref={header.ref} className={`flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 reveal ${header.visible ? 'visible' : ''}`}>
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-3">Maison Curates</p>
            <h2 className="font-display font-light text-[36px] sm:text-[42px] leading-none text-chalk">
              Shop by Brand
            </h2>
          </div>
          <div className="flex gap-4 flex-wrap sm:mb-1">
            {initialData.tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`text-xs font-medium pb-1 border-b-2 transition-all ${
                  activeTab === i
                    ? 'border-acid text-chalk'
                    : 'border-transparent text-chalk-3 hover:text-chalk'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div ref={grid.ref} className={`flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 reveal ${grid.visible ? 'visible' : ''}`}>
          {initialData.items.filter((brand) => activeTab === 0 || brand.tabs?.includes(activeTab)).map((brand, i) => (
            <Link
              key={brand.name}
              href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative min-h-[160px] w-[200px] flex-shrink-0 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
              style={{
                backgroundImage: `url(${brandImages[i % brandImages.length]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#F2EBE3',
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-deep-wine/60 transition-all duration-300" />

              {/* Decorative brand initial */}
              <span className="absolute -right-2 -top-4 text-[96px] font-extrabold leading-none select-none text-white/5 font-display pointer-events-none z-10">
                {brand.name[0]}
              </span>

              {/* Content */}
              <div className="relative z-20 p-[18px_16px] pb-12 h-full flex flex-col justify-end">
                <div className="text-[18px] font-light italic text-white group-hover:text-acid transition-colors mb-2 leading-tight font-display">
                  {brand.name}
                </div>
                <span className={`inline-flex items-center px-2 py-[3px] text-[11px] font-semibold w-fit backdrop-blur-sm ${offerCls[brand.type]}`}>
                  {brand.offer}
                </span>
              </div>

              {/* Slide-up "Shop Now" footer */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-acid text-void text-xs font-bold flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-30">
                <span>Shop Now</span>
                <svg className="w-3.5 h-3.5" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
