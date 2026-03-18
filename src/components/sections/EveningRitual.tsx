'use client'
import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import steps from '@/data/ritual-steps.json'

export default function EveningRitual() {
  const [hovered, setHovered] = useState<number | null>(null)
  const reveal = useReveal()

  return (
    <section className="bg-void-3 py-[72px] border-t border-border">
      <div ref={reveal.ref} className={`max-w-[1440px] mx-auto px-6 grid grid-cols-2 gap-20 items-center reveal ${reveal.visible ? 'visible' : ''}`}>
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-[7px] bg-[rgba(204,255,0,.08)] text-acid border border-[rgba(204,255,0,.2)] px-3 py-[5px] text-[11px] font-bold tracking-[0.08em] uppercase mb-5">
            ◆ The Method
          </div>
          <h2 className="text-[clamp(32px,3.5vw,52px)] font-extrabold text-chalk leading-[1.02] tracking-[-0.04em] font-display uppercase">
            Your Evening<br /><span className="text-acid">Ritual</span>
          </h2>
          <p className="text-[15px] text-chalk-2 leading-[1.75] mt-[18px] max-w-[440px]">
            Science-backed. Clinically tested. Four steps that deliver visible results in 28 days.
          </p>
          <div className="mt-10 flex flex-col">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={`flex gap-[18px] items-start py-[18px] border-b border-border last:border-b-0 cursor-pointer transition-all ${hovered === i ? 'pl-2' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={`text-[32px] font-extrabold leading-none min-w-[44px] transition-colors font-display ${hovered === i ? 'text-acid/60' : 'text-chalk/10'}`}>{step.n}</div>
                <div>
                  <div className="text-[13px] font-bold text-chalk mb-1 tracking-[0.02em]">{step.title}</div>
                  <div className="text-[13px] text-chalk-3 leading-[1.6]">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-9">
            <button className="px-7 py-[13px] bg-acid text-void text-[13px] font-bold flex items-center gap-2 hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop the Ritual
            </button>
            <button className="px-7 py-[13px] border border-border text-chalk-2 text-[13px] font-semibold hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em]">Learn More</button>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center relative">
          <svg width="220" height="320" viewBox="0 0 220 320" fill="none">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.9"/>
                <stop offset="50%" stopColor="#AADE00"/>
                <stop offset="100%" stopColor="#557700"/>
              </linearGradient>
              <filter id="rs"><feDropShadow dx="0" dy="15" stdDeviation="25" floodColor="rgba(204,255,0,.2)"/></filter>
            </defs>
            <rect x="80" y="40" width="60" height="44" rx="0" fill="#111"/>
            <rect x="80" y="40" width="60" height="44" rx="0" fill="rgba(204,255,0,.04)"/>
            <line x1="80" y1="80" x2="140" y2="80" stroke="rgba(204,255,0,.12)" strokeWidth="1"/>
            <rect x="86" y="80" width="48" height="14" rx="0" fill="url(#rg)"/>
            <rect x="56" y="94" width="108" height="210" rx="54" fill="url(#rg)" filter="url(#rs)"/>
            <rect x="58" y="96" width="30" height="192" rx="15" fill="rgba(255,255,255,.12)"/>
            <rect x="74" y="180" width="72" height="70" rx="0" fill="rgba(0,0,0,.3)" stroke="rgba(204,255,0,.2)" strokeWidth=".5"/>
            <text x="110" y="212" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="9" fontWeight="700" fill="rgba(204,255,0,.8)" letterSpacing="2">MAISON</text>
            <text x="110" y="230" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="7" fill="rgba(204,255,0,.4)" letterSpacing="1">Velvet Sérum</text>
            <ellipse cx="110" cy="310" rx="54" ry="7" fill="rgba(204,255,0,.08)"/>
          </svg>
          <div className="absolute bottom-0 left-0 bg-acid px-6 py-5">
            <div className="text-[40px] font-extrabold text-void leading-none font-display">94%</div>
            <div className="text-xs font-bold text-void/70 mt-1 uppercase tracking-[0.04em]">Visible results<br />in 28 days</div>
          </div>
        </div>
      </div>
    </section>
  )
}
