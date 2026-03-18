'use client'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import cats from '@/data/categories.json'

export default function TopCategories() {
  const header = useReveal()
  const list = useReveal()

  return (
    <section className="py-[52px] bg-void">
      <div className="max-w-[1440px] mx-auto px-6">
        <div ref={header.ref} className={`flex items-center justify-between mb-7 reveal ${header.visible ? 'visible' : ''}`}>
          <h2 className="text-[22px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">Top <span className="text-acid">Categories</span></h2>
          <Link href="/products" className="flex items-center gap-[6px] text-[13px] font-semibold text-acid hover:gap-[10px] transition-all uppercase tracking-[0.04em]">
            View All
            <svg className="w-[14px] h-[14px] stroke-acid" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
        <div ref={list.ref} className={`flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 reveal ${list.visible ? 'visible' : ''}`}>
          {cats.map(cat => (
            <Link
              key={cat.name}
              href={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-2 px-5 py-[10px] border border-border text-chalk-2 whitespace-nowrap text-[13px] font-semibold transition-all hover:-translate-y-px hover:border-acid hover:text-acid hover:bg-[rgba(204,255,0,.06)]"
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
