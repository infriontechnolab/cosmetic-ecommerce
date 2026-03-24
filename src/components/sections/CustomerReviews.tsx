'use client'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import type { Review } from '@/types/site'

function Stars({ rating }: { rating: string }) {
  const val = parseFloat(rating)
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className="w-[13px] h-[13px]" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={n <= Math.floor(val) ? '#8C5A3C' : n - 0.5 <= val ? 'url(#half)' : 'none'}
            stroke="#8C5A3C"
            strokeWidth="1.5"
          />
        </svg>
      ))}
      <span className="text-[12px] font-bold text-chalk ml-1">{rating}</span>
    </div>
  )
}

export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[52px] bg-void-2 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header with aggregate rating */}
        <div ref={header.ref} className={`flex items-end justify-between mb-8 reveal ${header.visible ? 'visible' : ''}`}>
          <div className="flex items-end gap-8">
            <div>
              <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-3">Voices</p>
              <h2 className="font-display font-light text-[42px] leading-none text-chalk">
                What Customers Say
              </h2>
            </div>
            <div className="mb-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-light text-[72px] leading-none text-chalk">4.9</span>
                <span className="text-chalk-3 text-base">/ 5.0</span>
              </div>
              <Stars rating="4.9" />
              <div className="text-[11px] text-chalk-3 font-medium mt-1">4,200+ verified reviews</div>
            </div>
          </div>
          <Link href="/products" className="text-[10px] tracking-[0.14em] uppercase text-chalk-3 hover:text-acid transition-colors border-b border-current pb-0.5 mb-1">
            All Reviews ↗
          </Link>
        </div>

        {/* Reviews grid — first card is featured (larger) */}
        <div ref={grid.ref} className={`grid grid-cols-1 md:grid-cols-3 gap-[14px] reveal ${grid.visible ? 'visible' : ''}`}>
          {reviews.map((r, i) => (
            <div
              key={r.name}
              className={`bg-surface border border-border hover:border-border-hi hover:-translate-y-0.5 transition-all relative overflow-hidden group ${
                i === 0 ? 'row-span-1' : ''
              }`}
            >
              {/* Decorative oversized quote mark */}
              <div className="absolute top-3 right-4 text-[72px] font-extrabold leading-none text-acid/8 font-display select-none pointer-events-none">
                "
              </div>

              <div className="p-6">
                {/* Reviewer info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-acid text-void flex-shrink-0 flex items-center justify-center text-[15px] font-bold">
                    {r.initial}
                  </div>
                  <div>
                    <div className="text-[15px] font-light text-chalk leading-tight font-display">{r.name}</div>
                    <div className="text-[11px] text-chalk-3 mt-[2px]">{r.meta}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-3">
                  <Stars rating={r.rating} />
                </div>

                {/* Review text */}
                <p className={`text-chalk-2 leading-[1.75] ${i === 0 ? 'text-[14px]' : 'text-[13px]'}`}>
                  {r.text}
                </p>

                {/* Product tag */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-chalk-3">On:</span>
                  <span className="text-[11px] font-semibold text-acid">{r.product}</span>
                </div>
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-acid scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
