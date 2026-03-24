import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden border-b border-border"
      style={{ height: 'calc(100dvh - 155px)', minHeight: 520 }}
    >
      {/* ── Background image ── */}
      <Image
        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1800&q=90&auto=format&fit=crop"
        alt="MAISON Beauty — Spring 2025 Collection"
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />

      {/* ── Gradient overlays ── */}
      {/* Bottom-up dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d12]/92 via-[#1a0d12]/45 to-transparent pointer-events-none" />
      {/* Left reinforcement for text */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a0d12]/55 via-[#1a0d12]/15 to-transparent pointer-events-none" />

      {/* ── Featured product card — desktop only ── */}
      <div
        className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col z-10 w-[210px] overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(253,250,246,0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.14)',
          animation: 'fadeUp .7s ease .45s both',
        }}
      >
        <div className="relative w-full h-[230px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=85&auto=format&fit=crop"
            alt="Featured product"
            fill
            className="object-cover object-center"
            sizes="210px"
          />
        </div>
        <div className="px-4 py-4">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: 'var(--color-terracotta)' }}
          >
            Featured
          </div>
          <div className="text-[13px] font-semibold text-white leading-snug font-display">
            Luminous Glow Serum
          </div>
          <div className="text-[12px] text-white/60 mt-0.5">30ml · Vitamin C &amp; Niacinamide</div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[15px] font-bold text-white">₹1,899</span>
            <Link
              href="/products"
              className="text-[11px] font-semibold uppercase tracking-wider hover:opacity-80 transition-opacity px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}
            >
              Shop
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content — bottom-left ── */}
      <div
        className="absolute bottom-10 left-6 sm:left-10 lg:bottom-14 lg:left-14 z-10"
        style={{ maxWidth: 540 }}
      >
        {/* Eyebrow */}
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4"
          style={{
            color: 'rgba(255,255,255,0.75)',
            animation: 'fadeUp .6s ease .0s both',
          }}
        >
          Maison Beauty &nbsp;·&nbsp; Spring 2025
        </div>

        {/* H1 */}
        <h1
          className="font-display text-white leading-[1.05]"
          style={{
            fontSize: 'clamp(42px, 6.5vw, 88px)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            animation: 'fadeUp .6s ease .1s both',
          }}
        >
          Redefine<br />
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Your</span> Ritual.
        </h1>

        {/* Subtext */}
        <p
          className="mt-5 text-white/65 leading-relaxed"
          style={{
            fontSize: 15,
            maxWidth: 400,
            animation: 'fadeUp .6s ease .2s both',
          }}
        >
          From skincare rituals to bold makeup — everything your routine deserves, curated in one place.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center gap-3 mt-8"
          style={{ animation: 'fadeUp .6s ease .3s both' }}
        >
          <Link
            href="/products"
            className="hover:opacity-90 transition-opacity"
            style={{
              background: 'var(--color-terracotta)',
              color: 'var(--color-ivory)',
              borderRadius: 8,
              padding: '13px 30px',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            Shop the Collection
          </Link>
          <Link
            href="/quiz/shade"
            className="hover:bg-white/15 transition-colors"
            style={{
              border: '1px solid rgba(255,255,255,0.35)',
              color: 'rgba(255,255,255,0.88)',
              borderRadius: 8,
              padding: '13px 28px',
              fontSize: 14,
              fontWeight: 400,
              textDecoration: 'none',
            }}
          >
            Take Skin Quiz →
          </Link>
        </div>

        {/* Trust dots */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-6"
          style={{ animation: 'fadeUp .6s ease .38s both' }}
        >
          {['Vegan', 'Cruelty-Free', 'Derm Tested', 'Paraben Free'].map((label, i) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-white/45"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}
            >
              {i > 0 && <span className="text-white/20">·</span>}
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-terracotta)', opacity: 0.7 }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator — desktop only ── */}
      <div
        className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 z-10"
        style={{ animation: 'fadeUp .6s ease .6s both' }}
      >
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/30 font-medium">Scroll</span>
        <span
          className="text-white/25"
          style={{ fontSize: 12, animation: 'float 2s ease-in-out infinite alternate' }}
        >
          ▼
        </span>
      </div>
    </section>
  )
}
