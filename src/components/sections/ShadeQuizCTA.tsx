import Image from 'next/image'
import Link from 'next/link'

export default function ShadeQuizCTA() {
  return (
    <section className="border-t border-b border-border overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">

        {/* Left — text (order-2 on mobile so photo appears first) */}
        <div
          className="order-2 md:order-1 py-10 md:py-[80px] px-6 md:px-12 flex flex-col justify-center relative overflow-hidden"
          style={{ background: 'var(--color-deep-wine)' }}
        >
          {/* Subtle terracotta vertical accent */}
          <div
            className="absolute top-0 left-0 w-[2px] h-full pointer-events-none"
            style={{ background: 'var(--color-terracotta)', opacity: 0.4 }}
          />

          <p
            className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3"
            style={{ color: 'var(--color-terracotta)' }}
          >
            Personalised for You
          </p>
          <h2 className="font-display font-light text-[36px] sm:text-[52px] leading-[1.05] text-white">
            Find your<br />
            <em className="italic" style={{ color: 'rgba(255,255,255,0.55)' }}>perfect shade</em>
            <br />match.
          </h2>
          <p
            className="text-[15px] mt-[18px] mb-8 max-w-[420px] leading-[1.65]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            5 quick questions. Personalised results. Reduces returns by 40%. Loved by 50,000+ customers.
          </p>

          {/* Stats row */}
          <div className="flex gap-4 sm:gap-8 mb-8">
            {[
              { value: '50K+', label: 'Happy customers' },
              { value: '40%', label: 'Fewer returns' },
              { value: '5 min', label: 'To complete' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-[28px] sm:text-[44px] font-light text-white font-display leading-none">{stat.value}</div>
                <div
                  className="text-[10px] sm:text-[11px] font-medium mt-1 uppercase tracking-[0.04em]"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quiz/shade"
              className="px-6 sm:px-8 py-[12px] sm:py-[14px] text-sm font-bold hover:opacity-90 hover:-translate-y-px transition-all uppercase tracking-[0.04em]"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}
            >
              Take the Shade Quiz →
            </Link>
            <Link
              href="/quiz/shade"
              className="px-5 sm:px-7 py-[11px] sm:py-[13px] text-sm font-semibold transition-colors hover:bg-white/10 uppercase tracking-[0.04em]"
              style={{ border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Right — editorial photo */}
        <div className="order-1 md:order-2 relative min-h-[220px] md:min-h-0">
          <Image
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=90&auto=format&fit=crop"
            alt="Find your perfect shade"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Left-edge blend */}
          <div className="absolute inset-0 bg-deep-wine/20" />

          {/* Floating shade swatches card */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-void/95 backdrop-blur-sm border border-border px-3 sm:px-5 py-3 sm:py-4">
            <div className="text-[10px] text-chalk-3 uppercase tracking-[0.08em] font-semibold mb-3">Shade Range</div>
            <div className="flex gap-[6px]">
              {['#F5E6D3', '#E8C9A0', '#D4A574', '#C08050', '#8B5E3C', '#5C3420'].map(shade => (
                <div
                  key={shade}
                  className="w-6 h-6 rounded-full border border-border shadow-xs hover:-translate-y-0.5 transition-transform cursor-pointer"
                  style={{ backgroundColor: shade }}
                />
              ))}
            </div>
            <div className="text-[11px] text-chalk-3 mt-2 font-medium">40 shades · all undertones</div>
          </div>
        </div>

      </div>
    </section>
  )
}
