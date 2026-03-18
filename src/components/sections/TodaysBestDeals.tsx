import Image from 'next/image'
import Link from 'next/link'
import { getDeals } from '@/lib/api'

export default async function TodaysBestDeals() {
  const deals = await getDeals()

  return (
    <section className="bg-void py-11 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-chalk font-display uppercase tracking-[-0.04em]">
            <span className="text-acid">HOT</span> — {"Today's Best Deals"}
          </h2>
          <Link href="/products" className="flex items-center gap-[6px] text-[13px] font-semibold text-chalk-2 border border-border px-4 py-[7px] hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em]">
            View All Deals <svg className="w-[14px] h-[14px] stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-[14px]">
          {deals.map(d => (
            <div key={d.id} className="bg-surface border border-border overflow-hidden cursor-pointer hover:-translate-y-[3px] hover:border-border-hi hover:shadow-[0_8px_32px_rgba(0,0,0,.5)] transition-all group">
              <div className="relative aspect-square overflow-hidden" style={{ background: d.bgColor }}>
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-[12px_14px]">
                <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em]">{d.brand}</div>
                <div className="text-[13px] font-bold text-chalk mt-[3px] leading-[1.3]">{d.name}</div>
                <div className="flex items-center gap-[6px] mt-[7px]">
                  <span className="text-[15px] font-extrabold text-chalk">{d.price}</span>
                  <span className="text-xs text-chalk-3 line-through">{d.was}</span>
                  <span className="text-xs font-extrabold text-void bg-acid px-[6px] py-[2px]">{d.pct}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
