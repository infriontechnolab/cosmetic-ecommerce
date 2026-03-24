import Image from 'next/image'
import Link from 'next/link'
import { getDeals } from '@/lib/api'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { AddDealButton } from '@/components/ui/AddDealButton'

export default async function TodaysBestDeals() {
  const deals = await getDeals()

  return (
    <section className="bg-void py-11 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-3">Daily Edit</p>
            <h2 className="font-display font-light text-[42px] leading-none text-chalk">
              {"Today's Best Deals"}
            </h2>
            <p className="text-[12px] text-chalk-3 mt-2 font-medium">
              {deals.length} deals · refreshed daily at midnight
            </p>
          </div>

          <div className="flex items-center gap-5 self-end mb-1">
            <CountdownTimer />
            <Link
              href="/products"
              className="text-[10px] tracking-[0.14em] uppercase text-chalk-3 hover:text-acid transition-colors border-b border-current pb-0.5"
            >
              View All ↗
            </Link>
          </div>
        </div>

        {/* Deal cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {deals.map((d, i) => (
            <div
              key={d.id}
              className="bg-surface border border-border overflow-hidden cursor-pointer hover:-translate-y-[3px] hover:border-border-hi transition-all group relative"
            >
              {/* Featured badge on first card */}
              {i === 0 && (
                <div className="absolute top-3 left-3 z-10 bg-acid text-void text-[10px] font-extrabold uppercase tracking-[0.06em] px-2 py-[3px]">
                  Best Deal
                </div>
              )}

              {/* Discount % badge */}
              <div className="absolute top-3 right-3 z-10 bg-blush-sand text-terracotta text-[11px] font-extrabold px-2 py-[3px] font-display">
                {d.pct}
              </div>

              {/* Product image */}
              <div className="relative aspect-square overflow-hidden" style={{ background: d.bgColor }}>
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.06]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Info */}
              <div className="p-[12px_14px]">
                <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em]">{d.brand}</div>
                <div className="text-[15px] font-light text-chalk mt-[3px] leading-[1.3] font-display">{d.name}</div>

                <div className="flex items-center gap-[6px] mt-[7px]">
                  <span className="text-[18px] font-light text-chalk font-display">{d.price}</span>
                  <span className="text-xs text-chalk-3 line-through">{d.was}</span>
                </div>

                {/* Add to cart row */}
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10px] text-acid font-semibold uppercase tracking-[0.04em]">
                    Limited stock
                  </span>
                  <AddDealButton deal={d} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
