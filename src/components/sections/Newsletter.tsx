'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubscribe() {
    if (!email || !email.includes('@')) return
    setStatus('loading')
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <section className="overflow-hidden" style={{ background: 'var(--color-deep-wine)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">

        {/* Left — photo with quote overlay */}
        <div className="relative hidden md:block h-full" style={{ minHeight: 400 }}>
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=1200&q=90&auto=format&fit=crop"
            alt="Maison Beauty Newsletter"
            fill
            className="object-cover object-center"
            sizes="50vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#1a0d12]/55 pointer-events-none" />
          {/* Quote */}
          <div className="absolute bottom-8 left-8 right-12 z-10">
            <p className="text-white font-display italic font-light text-[26px] leading-[1.35]">
              "Beauty is not a luxury.<br />It's a daily ritual."
            </p>
            <div
              className="tracking-[0.18em] uppercase text-[10px] mt-3 font-medium"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              — Maison Editorial
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="px-6 sm:px-12 py-12 sm:py-[72px] flex flex-col justify-center">
          <p
            className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: 'var(--color-terracotta)' }}
          >
            Stay in the Edit
          </p>
          <h2 className="font-display font-light text-[38px] sm:text-[42px] leading-[1.1] text-white">
            Be the first to hear<br />
            about <em className="italic" style={{ color: 'rgba(255,255,255,0.5)' }}>Maison</em>
          </h2>
          <p
            className="text-[14px] leading-[1.7] mt-[12px] mb-7 max-w-[400px]"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Exclusive launches, expert tips, and beauty offers — delivered straight to your inbox. No spam, ever.
          </p>

          <div className="flex gap-[10px] max-w-[420px]">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-[13px] text-sm text-white outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-sans)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />
            <button
              onClick={handleSubscribe}
              disabled={status === 'loading'}
              className="px-6 py-[13px] text-sm font-bold flex-shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-[0.04em] disabled:opacity-50"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </div>

          {status === 'success' && (
            <p className="mt-3 text-[13px] font-semibold" style={{ color: 'var(--color-terracotta)' }}>You're in!</p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-[13px] font-semibold text-red-400">Something went wrong. Try again.</p>
          )}

          {/* Perks list */}
          <div className="flex gap-5 mt-6 flex-wrap">
            {['Early access to launches', 'Expert skincare tips', 'Members-only offers'].map(perk => (
              <div key={perk} className="flex items-center gap-[6px] text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-terracotta)' }}
                />
                {perk}
              </div>
            ))}
          </div>

          <div className="text-[11px] mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
          </div>
        </div>

      </div>
    </section>
  )
}
