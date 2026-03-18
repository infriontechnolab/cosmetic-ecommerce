'use client'
import hero from '@/data/hero.json'

export default function HeroSection() {
  return (
    <section className="bg-void grid grid-cols-2 min-h-[480px] overflow-hidden relative border-b border-border">
      {/* Left */}
      <div className="pt-[60px] pr-12 pb-[60px] pl-16 flex flex-col justify-center">
        <div
          className="inline-flex items-center gap-[7px] bg-void-3 border border-border-hi px-3 py-[5px] text-xs font-bold tracking-[0.06em] uppercase w-fit mb-5 text-chalk-2"
          style={{ animation: 'fadeUp .6s .1s cubic-bezier(.4,0,.2,1) both' }}
        >
          <span className="text-acid text-[8px]" style={{ animation: 'pulseDot 2s infinite' }}>●</span>
          {hero.tagline}
        </div>
        <h1
          className="text-[clamp(36px,4.5vw,62px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-chalk font-display uppercase"
          style={{ animation: 'fadeUp .7s .2s cubic-bezier(.4,0,.2,1) both' }}
        >
          {hero.headline}<br />
          <span className="text-acid">{hero.headlineAccent}</span>
        </h1>
        <p
          className="text-base text-chalk-2 leading-[1.7] max-w-[420px] mt-4"
          style={{ animation: 'fadeUp .7s .32s cubic-bezier(.4,0,.2,1) both' }}
        >
          {hero.description}
        </p>
        <div
          className="flex gap-3 flex-wrap mt-8"
          style={{ animation: 'fadeUp .7s .44s cubic-bezier(.4,0,.2,1) both' }}
        >
          <button className="px-8 py-[14px] bg-acid text-void text-sm font-bold flex items-center gap-2 hover:bg-acid-dim hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(204,255,0,.2)] transition-all uppercase tracking-[0.04em]">
            <svg className="w-4 h-4 stroke-void" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {hero.ctaPrimary}
          </button>
          <button className="px-7 py-[13px] bg-transparent text-chalk-2 text-sm font-semibold border border-border hover:border-border-hi hover:text-chalk transition-colors uppercase tracking-[0.04em]">
            {hero.ctaSecondary}
          </button>
        </div>
        <div
          className="flex gap-7 flex-wrap mt-9 pt-9 border-t border-border"
          style={{ animation: 'fadeUp .7s .56s cubic-bezier(.4,0,.2,1) both' }}
        >
          {hero.stats.map(stat => (
            <div key={stat.label}>
              <div className="text-[22px] font-extrabold text-acid leading-none font-display">{stat.value}</div>
              <div className="text-xs font-medium text-chalk-3 mt-[3px] uppercase tracking-[0.04em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="relative overflow-hidden bg-void-3 flex items-center justify-center border-l border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,.06)_0%,transparent_70%)]" />
        <div className="relative z-10" style={{ animation: 'fadeIn .9s .3s both' }}>
          <svg width="280" height="380" viewBox="0 0 280 380" fill="none">
            <defs>
              <linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#AADE00"/>
                <stop offset="100%" stopColor="#557700"/>
              </linearGradient>
              <linearGradient id="hg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1A1A1A"/>
                <stop offset="100%" stopColor="#2A2A2A"/>
              </linearGradient>
              <filter id="s"><feDropShadow dx="0" dy="10" stdDeviation="20" floodColor="rgba(204,255,0,.15)"/></filter>
            </defs>
            <rect x="90" y="60" width="100" height="270" rx="50" fill="url(#hg1)" filter="url(#s)"/>
            <rect x="94" y="70" width="22" height="240" rx="11" fill="rgba(255,255,255,.1)"/>
            <rect x="108" y="10" width="64" height="54" rx="0" fill="#111"/>
            <rect x="108" y="10" width="64" height="54" rx="0" fill="rgba(204,255,0,.04)"/>
            <line x1="108" y1="58" x2="172" y2="58" stroke="rgba(204,255,0,.15)" strokeWidth="1"/>
            <rect x="112" y="58" width="56" height="16" rx="0" fill="url(#hg1)"/>
            <rect x="106" y="160" width="68" height="80" rx="0" fill="rgba(204,255,0,.07)" stroke="rgba(204,255,0,.2)" strokeWidth="1"/>
            <text x="140" y="197" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="11" fontWeight="700" fill="#CCFF00" letterSpacing="3">MAISON</text>
            <line x1="115" y1="207" x2="165" y2="207" stroke="rgba(204,255,0,.2)" strokeWidth="0.5"/>
            <text x="140" y="224" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="8" fill="rgba(204,255,0,.5)" letterSpacing="1">VELVET SERUM</text>
            <ellipse cx="140" cy="338" rx="52" ry="7" fill="rgba(204,255,0,.08)"/>
            <circle cx="56" cy="120" r="28" fill="url(#hg2)" opacity=".7"/>
            <circle cx="224" cy="200" r="18" fill="url(#hg2)" opacity=".5"/>
            <circle cx="68" cy="280" r="14" fill="#CCFF00" opacity=".04"/>
          </svg>
        </div>
        {/* Floating card */}
        <div className="absolute bottom-9 left-9 z-20 bg-surface border border-border-hi px-[18px] py-4 w-[200px] shadow-lg animate-float">
          <div className="inline-flex items-center gap-[5px] bg-void border border-acid text-acid text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-[3px] mb-2">{hero.spotlightBadge}</div>
          <div className="text-sm font-bold text-chalk leading-[1.3]">{hero.spotlightProduct}</div>
          <div className="text-acid text-xs mt-[6px] mb-1 tracking-[1px]">{hero.spotlightRating}</div>
          <div className="text-[11px] text-chalk-3">{hero.spotlightReviews}</div>
          <div className="text-base font-extrabold text-chalk mt-2">{hero.spotlightPrice}</div>
          <button className="w-full mt-[10px] py-[9px] bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">Add to Bag</button>
        </div>
      </div>
    </section>
  )
}
