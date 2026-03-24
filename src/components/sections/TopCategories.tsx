'use client'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import type { Category } from '@/types/site'

const categoryConfig: Record<string, {
  img: string
  icon: React.ReactNode
}> = {
  Makeup: {
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Lipstick — tube body */}
        <rect x="9.5" y="12.5" width="5" height="7" rx="0.4" strokeLinecap="round"/>
        {/* Bullet */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5 C9.5 12.5 9.5 8 12 6.5 C14.5 8 14.5 12.5 14.5 12.5"/>
        {/* Base cap line */}
        <line x1="9" y1="19.5" x2="15" y2="19.5" strokeLinecap="round"/>
        {/* Shoulder line */}
        <line x1="9.5" y1="12.5" x2="14.5" y2="12.5" strokeLinecap="round"/>
        {/* Small compact beside */}
        <circle cx="5.5" cy="10" r="2" strokeLinecap="round"/>
        <circle cx="5.5" cy="10" r="0.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  Skincare: {
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Serum dropper bottle — wide body */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10 C8 10 7.5 11 7.5 14 C7.5 18.5 9.5 20 12 20 C14.5 20 16.5 18.5 16.5 14 C16.5 11 16 10 15.5 10 Z"/>
        {/* Shoulder taper */}
        <path strokeLinecap="round" d="M9.5 10 C9.5 8.5 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.5 14.5 10"/>
        {/* Neck */}
        <rect x="11" y="4.5" width="2" height="3" rx="1" strokeLinecap="round"/>
        {/* Rubber bulb */}
        <ellipse cx="12" cy="3.5" rx="1.8" ry="1.2" strokeLinecap="round"/>
        {/* Label line */}
        <line x1="9" y1="14" x2="15" y2="14" strokeLinecap="round" strokeOpacity="0.5"/>
      </svg>
    ),
  },
  Hair: {
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Paddle brush — oval head */}
        <ellipse cx="12" cy="8.5" rx="6" ry="4.5" strokeLinecap="round"/>
        {/* Handle */}
        <path strokeLinecap="round" d="M12 13 L12 21"/>
        <path strokeLinecap="round" d="M10.5 21 Q12 22 13.5 21"/>
        {/* Bristle pins */}
        <line x1="9" y1="7" x2="9" y2="10" strokeLinecap="round"/>
        <line x1="11" y1="6" x2="11" y2="10" strokeLinecap="round"/>
        <line x1="13" y1="6" x2="13" y2="10" strokeLinecap="round"/>
        <line x1="15" y1="7" x2="15" y2="10" strokeLinecap="round"/>
      </svg>
    ),
  },
  Fragrance: {
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Flacon body — wide flat perfume bottle */}
        <rect x="7" y="10" width="10" height="10" rx="1.5" strokeLinecap="round"/>
        {/* Neck */}
        <rect x="10.5" y="6.5" width="3" height="3.5" rx="0.5" strokeLinecap="round"/>
        {/* Cap / atomizer */}
        <rect x="9.5" y="4.5" width="5" height="2" rx="0.7" strokeLinecap="round"/>
        {/* Atomizer arm */}
        <path strokeLinecap="round" d="M14.5 5.5 L17.5 5.5 L17.5 4"/>
        {/* Spray dots */}
        <circle cx="18.5" cy="3.5" r="0.4" fill="currentColor"/>
        <circle cx="19.5" cy="4.5" r="0.4" fill="currentColor"/>
        <circle cx="18" cy="4.8" r="0.35" fill="currentColor"/>
        {/* Label score */}
        <line x1="8.5" y1="14" x2="15.5" y2="14" strokeLinecap="round" strokeOpacity="0.4"/>
        <line x1="8.5" y1="16.5" x2="13" y2="16.5" strokeLinecap="round" strokeOpacity="0.4"/>
      </svg>
    ),
  },
  Men: {
    img: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Safety razor — handle */}
        <line x1="12" y1="12" x2="12" y2="21" strokeLinecap="round"/>
        {/* Knurled grip marks */}
        <line x1="11" y1="15" x2="13" y2="15" strokeLinecap="round" strokeOpacity="0.5"/>
        <line x1="11" y1="17" x2="13" y2="17" strokeLinecap="round" strokeOpacity="0.5"/>
        <line x1="11" y1="19" x2="13" y2="19" strokeLinecap="round" strokeOpacity="0.5"/>
        {/* Head */}
        <rect x="7" y="8.5" width="10" height="3.5" rx="0.5" strokeLinecap="round"/>
        {/* Blade edge */}
        <line x1="7.5" y1="10" x2="16.5" y2="10" strokeLinecap="round"/>
        {/* Cap */}
        <path strokeLinecap="round" d="M7.5 8.5 Q12 5.5 16.5 8.5"/>
      </svg>
    ),
  },
  'Bath & Body': {
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Soap bar */}
        <rect x="5" y="12" width="14" height="8" rx="2.5" strokeLinecap="round"/>
        {/* Embossed name line */}
        <line x1="8" y1="16" x2="16" y2="16" strokeLinecap="round" strokeOpacity="0.4"/>
        <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" strokeLinecap="round" strokeOpacity="0.4"/>
        {/* Bubbles */}
        <circle cx="5.5" cy="9.5" r="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="8" r="1" strokeLinecap="round"/>
        <circle cx="13" cy="9" r="1.8" strokeLinecap="round"/>
        <circle cx="17.5" cy="8.5" r="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  Wellness: {
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Lotus — center petal */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19 C12 19 8 16 8 12 C8 9.5 10 8 12 7 C14 8 16 9.5 16 12 C16 16 12 19 12 19 Z"/>
        {/* Left petal */}
        <path strokeLinecap="round" d="M8 12 C8 12 4 11 3.5 8 C5.5 7 8 8.5 8 12"/>
        {/* Right petal */}
        <path strokeLinecap="round" d="M16 12 C16 12 20 11 20.5 8 C18.5 7 16 8.5 16 12"/>
        {/* Stem */}
        <path strokeLinecap="round" d="M12 19 Q12 21.5 11 22.5"/>
        <path strokeLinecap="round" d="M12 19 Q12.5 21 12 22.5"/>
        {/* Small leaf */}
        <path strokeLinecap="round" d="M12 21 Q14 20 15 21.5"/>
      </svg>
    ),
  },
  'Gifts & Sets': {
    img: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Box body */}
        <rect x="4" y="11" width="16" height="10" rx="0.5" strokeLinecap="round"/>
        {/* Lid */}
        <rect x="3" y="8" width="18" height="3" rx="0.5" strokeLinecap="round"/>
        {/* Vertical ribbon */}
        <line x1="12" y1="8" x2="12" y2="21" strokeLinecap="round"/>
        {/* Horizontal ribbon on lid */}
        <line x1="3" y1="9.5" x2="21" y2="9.5" strokeLinecap="round"/>
        {/* Bow left loop */}
        <path strokeLinecap="round" d="M12 8 C10 5 7 5.5 7 7.5 C7 8.5 9 9 12 8"/>
        {/* Bow right loop */}
        <path strokeLinecap="round" d="M12 8 C14 5 17 5.5 17 7.5 C17 8.5 15 9 12 8"/>
      </svg>
    ),
  },
  Tools: {
    img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Fan brush — handle */}
        <path strokeLinecap="round" d="M12 13 L12 21"/>
        <path strokeLinecap="round" d="M11 21 Q12 22 13 21"/>
        {/* Ferrule / collar */}
        <rect x="10.5" y="11" width="3" height="2.5" rx="0.3" strokeLinecap="round"/>
        {/* Fan bristles — splayed out */}
        <path strokeLinecap="round" d="M12 11 C12 11 7 8 5.5 4.5"/>
        <path strokeLinecap="round" d="M12 11 C12 11 8.5 7.5 9 4"/>
        <path strokeLinecap="round" d="M12 11 C12 11 11 7 12 3.5"/>
        <path strokeLinecap="round" d="M12 11 C12 11 13 7 12 3.5" strokeOpacity="0.6"/>
        <path strokeLinecap="round" d="M12 11 C12 11 15.5 7.5 15 4"/>
        <path strokeLinecap="round" d="M12 11 C12 11 17 8 18.5 4.5"/>
      </svg>
    ),
  },
  Minis: {
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80&auto=format&fit=crop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7">
        {/* Three small bottles of different heights */}
        {/* Left bottle — short round */}
        <rect x="3.5" y="14" width="4.5" height="6" rx="1.5" strokeLinecap="round"/>
        <rect x="5" y="12" width="1.5" height="2" rx="0.4" strokeLinecap="round"/>
        <rect x="4.5" y="11" width="2.5" height="1" rx="0.4" strokeLinecap="round"/>
        {/* Center bottle — tallest */}
        <rect x="9.5" y="10" width="5" height="10" rx="1" strokeLinecap="round"/>
        <rect x="11" y="7.5" width="2" height="2.5" rx="0.4" strokeLinecap="round"/>
        <rect x="10.5" y="6.5" width="3" height="1" rx="0.4" strokeLinecap="round"/>
        {/* Right bottle — medium */}
        <rect x="16" y="12" width="4.5" height="8" rx="1.5" strokeLinecap="round"/>
        <rect x="17.5" y="10" width="1.5" height="2" rx="0.4" strokeLinecap="round"/>
        <rect x="17" y="9" width="2.5" height="1" rx="0.4" strokeLinecap="round"/>
      </svg>
    ),
  },
}

export default function TopCategories({ cats }: { cats: Category[] }) {
  const header = useReveal()
  const list = useReveal()

  return (
    <section className="py-[80px] bg-void border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div ref={header.ref} className={`flex items-end justify-between mb-10 reveal ${header.visible ? 'visible' : ''}`}>
          <div>
            <p className="text-[9px] font-black tracking-[0.32em] uppercase text-acid mb-3">Explore the World of Maison</p>
            <h2 className="font-display font-black text-[40px] sm:text-[60px] leading-none text-chalk tracking-[-0.03em]">
              Top <em className="italic text-acid">Categories</em>
            </h2>
          </div>
          <Link href="/products" className="text-[10px] font-black tracking-[0.2em] uppercase text-chalk-3 hover:text-acid transition-colors border-b-2 border-current pb-0.5 mb-2">
            View All ↗
          </Link>
        </div>

        <div ref={list.ref} className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 reveal ${list.visible ? 'visible' : ''}`}>
          {cats.map(cat => {
            const cfg = categoryConfig[cat.name]
            return (
              <Link
                key={cat.name}
                href={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="aspect-[3/4] relative flex flex-col justify-end overflow-hidden border border-border hover:border-terracotta hover:-translate-y-[6px] transition-all duration-300 group"
                style={{
                  backgroundImage: cfg ? `url(${cfg.img})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#F2EBE3',
                }}
              >
                {/* Dark overlay — heavier for text legibility */}
                <div className="absolute inset-0 bg-deep-wine/55 transition-all duration-300" />

                {/* Hover colour tint */}
                <div className="absolute inset-0 bg-acid/0 group-hover:bg-acid/8 transition-all duration-300" />

                {/* Content pinned to bottom */}
                <div className="relative z-10 p-4 pt-10">
                  <span className="text-white/60 group-hover:text-acid transition-colors duration-200 block mb-2">
                    {cfg?.icon}
                  </span>
                  <span className="text-[22px] font-black text-white leading-tight block font-display tracking-[-0.01em] transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-acid font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 mt-[5px] block">
                    Explore →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
