'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import type { SkinConcern } from '@/types/site'

const concernConfig: Record<string, {
  accent: string
  img: string
  description: string
  icon: React.ReactNode
}> = {
  Dryness: {
    accent: '#4A90C4',
    img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&auto=format&fit=crop',
    description: 'Deep moisture for every skin type',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-7 6.5-7 12a7 7 0 0014 0C19 9.5 12 3 12 3z"/>
        <path strokeLinecap="round" d="M9 16c.5 1.5 2 2.5 3 2.5"/>
      </svg>
    ),
  },
  'Dark Spots': {
    accent: '#C9A84C',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80&auto=format&fit=crop',
    description: 'Glow-boosting serums & treatments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="4" strokeLinecap="round"/>
        <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
  },
  'Anti-Aging': {
    accent: '#8A6DB5',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80&auto=format&fit=crop',
    description: 'Turn back time with actives',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2 6h6l-5 3.5 2 6L12 15l-5 3.5 2-6L4 9h6l2-6z"/>
      </svg>
    ),
  },
  'Acne & Blemishes': {
    accent: '#4A9C6A',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format&fit=crop',
    description: 'Clear skin, refined texture',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 2-4 3.5-4 6.5a4 4 0 008 0C16 6.5 13.5 5 12 3z"/>
        <path strokeLinecap="round" d="M12 21v-7M9 17l3 4 3-4"/>
      </svg>
    ),
  },
  Sensitivity: {
    accent: '#C47D7D',
    img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80&auto=format&fit=crop',
    description: 'Gentle formulas, zero irritation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/>
        <path strokeLinecap="round" d="M16 8L2 22M17.5 15H9"/>
      </svg>
    ),
  },
  Oiliness: {
    accent: '#2A8A7A',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop',
    description: 'Balance & mattify for a fresh finish',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17c0-3.31 3.13-6 7-6s7 2.69 7 6"/>
        <path strokeLinecap="round" d="M3 17h18M12 2v3M4.22 5.22l2.12 2.12M19.78 5.22l-2.12 2.12M2 12h3M19 12h3"/>
      </svg>
    ),
  },
  'Dark Circles': {
    accent: '#5B5B9E',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80&auto=format&fit=crop',
    description: 'Brighten & de-puff the eye area',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <ellipse cx="12" cy="12" rx="9" ry="5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" strokeLinecap="round"/>
        <path strokeLinecap="round" d="M3 12c2-3 5-4 9-4s7 1 9 4"/>
      </svg>
    ),
  },
  Pores: {
    accent: '#8A7A6B',
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80&auto=format&fit=crop',
    description: 'Refine texture for a smooth canvas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="9" strokeLinecap="round"/>
        <circle cx="9" cy="10" r="1.2" strokeLinecap="round"/>
        <circle cx="14" cy="9" r="1" strokeLinecap="round"/>
        <circle cx="11" cy="14" r="1.5" strokeLinecap="round"/>
        <circle cx="15.5" cy="13.5" r="0.8" strokeLinecap="round"/>
      </svg>
    ),
  },
}

export default function SkinConcerns({ concerns }: { concerns: SkinConcern[] }) {
  const [active, setActive] = useState<number | null>(null)
  const header = useReveal()
  const grid = useReveal()

  return (
    <section className="py-[72px] bg-surface">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div ref={header.ref} className={`flex items-end justify-between mb-10 reveal ${header.visible ? 'visible' : ''}`}>
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-3">Your Skin, Your Story</p>
            <h2 className="font-display font-light text-[42px] leading-none text-chalk">
              Shop by Skin Concern
            </h2>
          </div>
          <Link href="/products" className="text-[10px] tracking-[0.14em] uppercase text-chalk-3 hover:text-acid transition-colors border-b border-current pb-0.5 mb-1">
            View All ↗
          </Link>
        </div>

        <div ref={grid.ref} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal ${grid.visible ? 'visible' : ''}`}>
          {concerns.map((c, i) => {
            const cfg = concernConfig[c.label]
            const isActive = active === i
            const accent = cfg?.accent ?? '#555555'

            return (
              <div
                key={c.label}
                onClick={() => setActive(isActive ? null : i)}
                className="relative min-h-[200px] cursor-pointer overflow-hidden transition-all duration-300 group"
                style={{
                  backgroundImage: cfg ? `url(${cfg.img})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#111',
                  transform: isActive ? 'translateY(-5px)' : undefined,
                  boxShadow: isActive ? `0 12px 32px ${accent}40` : undefined,
                }}
              >
                {/* Accent-coloured overlay — shifts opacity on active */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(160deg, ${accent}CC 0%, ${accent}99 60%, rgba(0,0,0,0.75) 100%)`,
                    opacity: isActive ? 1 : 0.82,
                  }}
                />

                {/* Hover brightening */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />

                {/* Content */}
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div>
                    {/* Icon */}
                    <span className="text-white block mb-3" style={{ stroke: 'white' }}>
                      {cfg?.icon}
                    </span>
                    {/* Name */}
                    <div className="text-[22px] font-light text-white leading-tight font-display">{c.label}</div>
                    {/* Count */}
                    <div className="text-[12px] text-white/70 mt-1">{c.count}</div>
                  </div>

                  {/* Micro-description — expands on active */}
                  <div
                    className="overflow-hidden transition-all duration-300 text-[12px] text-white/90 font-medium leading-snug"
                    style={{
                      maxHeight: isActive ? '40px' : '0px',
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? '10px' : '0px',
                    }}
                  >
                    {cfg?.description}
                  </div>
                </div>

                {/* Active border ring */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${accent}`,
                    opacity: isActive ? 1 : 0,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
