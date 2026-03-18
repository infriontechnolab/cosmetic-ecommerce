import Link from 'next/link'

export default function ShadeQuizCTA() {
  return (
    <section className="bg-void border-t border-b border-border py-[80px] px-6 relative overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-acid/40 via-acid/10 to-transparent pointer-events-none" />
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-[7px] bg-void-3 border border-border-hi px-[14px] py-[5px] text-xs font-bold tracking-[0.08em] uppercase mb-[18px] text-chalk-3">
          ◆ Personalised for You
        </div>
        <h2 className="text-[clamp(36px,5vw,72px)] font-extrabold text-chalk tracking-[-0.04em] leading-[1.0] font-display uppercase">
          Find your<br /><span className="text-acid">perfect shade</span><br />match.
        </h2>
        <p className="text-[15px] text-chalk-2 mx-auto mt-[18px] mb-8 max-w-[500px] leading-[1.65]">
          5 quick questions. Personalised results. Reduces returns by 40%. Loved by 50,000+ customers.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/quiz/shade" className="px-8 py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim hover:-translate-y-px transition-all uppercase tracking-[0.04em]">Take the Shade Quiz →</Link>
          <Link href="/quiz/shade" className="px-7 py-[13px] bg-transparent text-chalk-2 text-sm font-semibold border border-border hover:border-border-hi hover:text-chalk transition-colors uppercase tracking-[0.04em]">See How It Works</Link>
        </div>
      </div>
    </section>
  )
}
