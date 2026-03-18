'use client'
import { useReveal } from '@/hooks/useReveal'
import reviews from '@/data/reviews.json'

export default function CustomerReviews() {
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[52px] bg-void-2 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6">
        <div ref={header.ref} className={`flex items-center justify-between mb-7 reveal ${header.visible ? 'visible' : ''}`}>
          <h2 className="text-[22px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">What Customers <span className="text-acid">Say</span></h2>
          <a href="#" className="flex items-center gap-[6px] text-[13px] font-semibold text-acid hover:gap-[10px] transition-all uppercase tracking-[0.04em]">
            4,200+ Reviews <svg className="w-[14px] h-[14px] stroke-acid" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div ref={grid.ref} className={`grid grid-cols-3 gap-[14px] reveal ${grid.visible ? 'visible' : ''}`}>
          {reviews.map(r => (
            <div key={r.name} className="bg-surface border border-border p-6 hover:border-border-hi hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-acid text-void flex-shrink-0 flex items-center justify-center text-base font-bold">{r.initial}</div>
                <div>
                  <div className="text-sm font-bold text-chalk">{r.name}</div>
                  <div className="text-xs text-chalk-3 mt-0.5">{r.meta}</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 bg-acid text-void px-2 py-[3px] text-xs font-bold mb-3">
                <svg className="w-[10px] h-[10px] fill-void" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {r.rating}
              </div>
              <p className="text-sm text-chalk-2 leading-[1.7]">{r.text}</p>
              <div className="text-xs text-chalk-3 mt-3 pt-3 border-t border-border">On: <strong className="text-acid font-semibold">{r.product}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
