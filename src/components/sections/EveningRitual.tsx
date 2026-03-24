'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import steps from '@/data/ritual-steps.json'

export default function EveningRitual() {
  const [hovered, setHovered] = useState<number | null>(null)
  const reveal = useReveal()

  return (
    <section className="bg-void-3 py-12 lg:py-[72px] border-t border-border">
      <div ref={reveal.ref} className={`max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center reveal ${reveal.visible ? 'visible' : ''}`}>

        {/* Left — content */}
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-3">The Method</p>
          <h2 className="font-display font-light text-[52px] leading-[1.05] text-chalk">
            Your Evening<br /><em className="italic text-acid">Ritual</em>
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
                <div className={`text-[48px] font-light leading-none min-w-[44px] transition-colors font-display ${hovered === i ? 'text-chalk-3/60' : 'text-chalk-3/20'}`}>
                  {step.n}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-chalk mb-1 tracking-[0.02em]">{step.title}</div>
                  <div className="text-[13px] text-chalk-3 leading-[1.6]">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-9">
            <Link href="/products" className="px-7 py-[13px] bg-acid text-void text-[13px] font-bold flex items-center gap-2 hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop the Ritual
            </Link>
            <Link href="/about" className="px-7 py-[13px] border border-border text-chalk-2 text-[13px] font-semibold hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em]">
              Learn More
            </Link>
          </div>
        </div>

        {/* Right — real product photo */}
        <div className="relative h-[300px] sm:h-[420px] lg:h-[560px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=85&auto=format&fit=crop"
            alt="Velvet Sérum — Evening Ritual"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* Subtle bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-deep-wine/20 pointer-events-none" />

          {/* Floating product label — top right */}
          <div className="absolute top-5 right-5 bg-void/95 backdrop-blur-sm border border-border px-4 py-3 shadow-sm">
            <div className="text-[10px] text-chalk-3 uppercase tracking-[0.08em] font-semibold">Hero Product</div>
            <div className="text-[14px] font-bold text-chalk mt-[3px]">Velvet Sérum</div>
            <div className="text-acid text-[11px] font-semibold mt-[3px]">5% Peptide Complex · 3% HA</div>
          </div>

          {/* 94% stat — bottom left */}
          <div className="absolute bottom-0 left-0 bg-acid px-6 py-5">
            <div className="text-[40px] font-extrabold text-void leading-none font-display">94%</div>
            <div className="text-xs font-bold text-void/70 mt-1 uppercase tracking-[0.04em]">
              Visible results<br />in 28 days
            </div>
          </div>

          {/* Step count badge — bottom right */}
          <div className="absolute bottom-0 right-0 bg-chalk px-5 py-4">
            <div className="text-[28px] font-extrabold text-void leading-none font-display">4</div>
            <div className="text-[10px] font-bold text-void/60 mt-[2px] uppercase tracking-[0.06em]">
              Step<br />System
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
